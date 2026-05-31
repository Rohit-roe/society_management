module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join_society', (societyId) => {
      if (societyId) socket.join(String(societyId));
    });

    socket.on('join-society', (societyId) => {
      if (societyId) socket.join(String(societyId));
    });

    socket.on('join_user', (userId) => {
      if (userId) socket.join(String(userId));
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};
