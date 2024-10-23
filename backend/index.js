import Express from "express";
import cors from "cors";
import dotenv from "dotenv";
import CustomerRouter from "./Routes/customerCreate.js"; 
import AdminRouter from "./Routes/adminCreate.js"; 
import DriverRouter from "./Routes/driverCreate.js"; 
import BookingRouter from './Routes/bookingService.js';
import http from 'http'
import {Server as socketio} from "socket.io"

const app = Express();
const server = http.createServer(app);
const io = new socketio(server);

dotenv.config();


const port = process.env.PORT || 27019;
 

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ["https://your-production-url.com"] 
    : ["http://localhost:3000"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization","auth-token"],
  credentials: true,
};

io.on('connection', (socket) => {
  console.log('A user connected: ' + socket.id);
  socket.on('locationUpdate', ({ driverId, location, deliveryStatus }) => {
      io.emit('locationUpdate', { driverId, location, deliveryStatus });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
  });
});


app.use(cors(corsOptions));
app.use(Express.json());

// User Authentication routes
app.use("/api/user", CustomerRouter);
app.use("/api/user", AdminRouter);
app.use("/api/user", DriverRouter);
app.use("/api/booking",BookingRouter);

// Test route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
