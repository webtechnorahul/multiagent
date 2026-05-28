import 'dotenv/config';
import {ChatMistralAI} from "@langchain/mistralai";
import {listFiles,readFiles,updateFiles} from "./tools.js";
import {createAgent} from "langchain";

console.log("agent working")
const model=new ChatMistralAI({
    apikey:process.env.MISTRAL_API_KEY,
    model:"mistral-medium-latest",
    temperature:0,
})

const agent=createAgent({
    model,
    tools:[listFiles,readFiles,updateFiles]
})

await agent.invoke({
    messages:[
        {
            role:"user",
            content:"create a snake game in app.jsx file you use html,css and js"
        }
    ]
})