const mongoose = require('mongoose');


mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
    retryWrites: false
}).then(() => {
    console.log('db connected');
}).catch(err => console.log(err));

mongoose.connection.on('connected', () => {
    console.log('MongoDB connected to DB server');
});
mongoose.connection.on('error', (err) => {
    console.log(err.message);
});
mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});