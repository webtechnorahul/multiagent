import axios from 'axios';
import {tool} from 'langchain';
import * as z from 'zod';


export const listFiles=tool(
    async ({})=>{
        const response =await axios.get("http://019e6366-39aa-7467-a7d7-b1058724de72.agent.localhost/list-files");

        console.log("===================");
        console.log("response from list-files tool:-",response.data);
        console.log("===================");
        
        return response.data.files
    },{
        name:'list-files',
        description:'List all files in the project directory.',
        schema:z.object({}),
    }
)

export const readFiles = tool(
  async ({ files }) => {
    // Keep your original API endpoint URL format
    const response = await axios.post("http://019e6366-39aa-7467-a7d7-b1058724de72.agent.localhost" + files.join(","));
    console.log("=== read-files response ===", response.data);
    return JSON.stringify(response.data);
  },
  {
    name: "read_files", // Alphanumeric & underscores only
    description: "Read the content of specified files. Input must be an array of file names.",
    schema: z.object({
      files: z.array(z.string()).describe("the list of file names to read")
    })
  }
);

export const updateFiles=tool(
    async({files})=>{
        const response=await axios.patch("http://019e6366-39aa-7467-a7d7-b1058724de72.agent.localhost/update-files",{
            updates:files
        })

        console.log("===================");
        console.log("response from update-files tool:-",response.data);
        console.log("===================");


        return JSON.stringify(response.data)
    },{
        name:"update-files",
        description:"Update the content of specified files. Input should be an array of file updates.",
        schema:z.object({
            files:z.array(z.object({
                file:z.string().describe("the name of the file to update"),
                content:z.string().describe("the new content for the file")
            })).describe("the list of file updates")
        })
    }
)