import express from 'express';
import SocketIO from 'socket.io';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';

interface Offer {
  type: string;
  sdp: string;
}

interface SocketPeer {
  id: string;
  offer?: Offer;
  isInitiator?: boolean;
  searchInterval?: NodeJS.Timer;
  isPaired?: boolean;
}

const peers = new Map<string, SocketPeer>();

const getUnpairedPeer = (socket: SocketIO.Socket) => {
  const [peerId] = Array.from(peers.entries())
    .filter(
      ([id, peer]) => id !== socket.id && !peer.isInitiator && !peer.isPaired
    )
    .map(([id]) => id);

  if (peers.has(peerId)) {
    return peers.get(peerId);
  }
};

const handleMessages = (io: SocketIO.Server, socket: SocketIO.Socket) => {
  socket
    .on('message', ({ type, message, ...rest }) => {
      console.log('MSG', type, message);
      switch (type) {
        case 'peers':
          return { type, connectedPeers: peers.keys() };
          break;
        default:
          console.log('Unknown msg', type, message, rest);
          break;
      }
    })
    .on('join', () => {
      const peer = peers.get(socket.id);
      if (!peer) {
        return;
      }

      const unpairedPeer = getUnpairedPeer(socket);
      console.log('JOIN', socket.id, unpairedPeer?.id);
      if (unpairedPeer) {
        peer.isInitiator = false;
        peer.isPaired = true;
        unpairedPeer.isInitiator = true;
        unpairedPeer.isPaired = true;
        socket.emit('pair', { initiator: true, peerId: unpairedPeer.id });
        // io.to(unpairedPeer.id).emit('pair', {
        //   initiator: false,
        //   peerId: socket.id,
        // });
      }
    })
    .on('signal', ({ offer, pairedPeerId }) => {
      const peer = peers.get(socket.id);
      const pairedPeer = peers.get(pairedPeerId);
      if (!peer || !pairedPeer) {
        return;
      }

      // peer.offer = offer;

      console.log(socket.id, 'sending offer');
      io.to(pairedPeerId).emit('pair', {
        initiator: false,
        peerId: socket.id,
        offer,
      });

      // const getOtherPeer = () =>
      //   Array.from(peers.entries())
      //     .filter(
      //       ([id, peer]) =>
      //         id !== socket.id &&
      //         peer.offer &&
      //         !peer.isInitiator &&
      //         !peer.isPaired
      //     )
      //     .map(([id]) => id)
      //     .reduce(
      //       (p, c, i, arr) => arr[Math.floor(Math.random() * arr.length)],
      //       null
      //     );
      // let otherPeer = getOtherPeer();

      // if (!otherPeer) {
      //   peer.isInitiator = true;
      //   peer.searchInterval = setInterval(() => {
      //     otherPeer = getOtherPeer();
      //     console.log(socket.id, 'PEER?', otherPeer);
      //     if (otherPeer) {
      //       clearInterval(peer.searchInterval);
      //       peer.searchInterval = null;
      //       peer.isPaired = true;
      //       const randomPeer = peers.get(otherPeer);
      //       randomPeer.isPaired = true;

      //       socket.emit('peer', {
      //         peerId: randomPeer.id,
      //         offer: randomPeer.offer,
      //       });
      //     }
      //   }, 1000);
      // } else {
      //   const randomPeer = peers.get(otherPeer);
      //   randomPeer.isPaired = true;
      //   socket.emit('peer', { peerId: randomPeer.id, offer: randomPeer.offer });
      // }
    })
    .on('peer', (peerId: string) => {
      const peer = peers.get(peerId);
      if (peer?.offer) {
        io.to(peerId).emit('signal', { id: peer.id, offer: peer.offer });
      }
    })
    .on('disconnect', () => {
      console.log('Socket %s closed', socket.id);
      const peer = peers.get(socket.id);
      if (peer?.searchInterval) {
        clearInterval(peer.searchInterval);
      }
      peers.delete(socket.id);
    })
    .on('offer', offer => {
      socket.emit('offer', offer);
    })
    .on('answer', answer => {
      socket.emit('answer', answer);
    });
};

const bootstrap = async () => {
  try {
    const port = +process.env.PORT || 3333;
    const app = express();

    app
      .use(
        cors({
          origin: [/localhost:4200$/, /\.trycloudflare\.com$/],
          credentials: true,
          maxAge: 86400,
        })
      )
      .use(helmet())
      .use(bodyParser.json());

    const server = app.listen(port, () => {
      console.log(`Listening on *:${port}`);
    });
    const io = new SocketIO(server);

    io.on('connection', socket => {
      console.log('New socket: %s', socket.id);
      peers.set(socket.id, { id: socket.id });
      handleMessages(io, socket);
    });
  } catch (e) {
    console.error(e);
  }
};

bootstrap();
