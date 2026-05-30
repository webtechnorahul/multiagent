import express from 'express';
import morgan from 'morgan';
import agentRoutes from './routes/agent.routes.js';

const app=express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use('/api/ai/agent',agentRoutes);
app.get('/',(req,res)=>{
    res.status(200).json({message:"api worked successfully"});
})
app.get('/api/status/healthz',(req,res)=>{
    res.status(200).json({message:"api is healthy"});
})

export default app