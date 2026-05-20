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
app.use((req,res,next)=>{
    const host=req.headers.host;
    const sandboxid=host.split(".")[0];

    return getProxy(sandboxid)(req,res,next);

})

export default app;
