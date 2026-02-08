const socketIo = require('socket.io');

const initSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Join user-specific room for alerts
        socket.on('join_user_room', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined their notification room`);
        });

        // Join asteroid-specific chat room
        socket.on('join_asteroid_chat', (asteroidId) => {
            socket.join(`chat_${asteroidId}`);
            console.log(`Client joined chat for asteroid: ${asteroidId}`);
        });

        socket.on('send_message', (data) => {
            const { asteroidId, message, username } = data;
            io.to(`chat_${asteroidId}`).emit('receive_message', {
                username,
                message,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    return io;
};

module.exports = { initSocket };
