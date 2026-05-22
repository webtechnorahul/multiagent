import express from "express";
import morgan from "morgan";
import {createProxyMiddleware} from "http-proxy-middleware"

const app=express();

app.use(morgan("combined"));

app.get("/api/status/healthz",(req,res)=>{
    res.status(200).json({status:"ok"});
})
app.get("/api/status/readyz",(req,res)=>{
    res.status(200).json({status:"ready"});
})

const proxies={}
const agentproxies={}
function getProxy(sandboxid){
    if(!proxies[sandboxid]){
        const target=`http://sandbox-service-${sandboxid}`;
        proxies[sandboxid]=createProxyMiddleware({
        target,
        changeOrigin:true,
        ws:true
    })
    }
    return proxies[sandboxid];
}

function getAgentProxy(sandboxid){
    if(!agentproxies[sandboxid]){
        const target=`http://sandbox-service-${sandboxid}:3000`;
        agentproxies[sandboxid]=createProxyMiddleware({
        target,
        changeOrigin:true,
        ws:true
    })
    }
    return agentproxies[sandboxid];
}

app.use((req,res,next)=>{
    const host=req.headers.host;
    const sandboxid=host.split(".")[0];

    if(host.split('.')[1]==="agent"){
        return getAgentProxy(sandboxid)(req,res,next);
    }
    else if(host.split('.')[1]==="preview"){
        return getProxy(sandboxid)(req,res,next);
    }

    

})

export default app;
