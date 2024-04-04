import Axios from "axios";
import { AllHttpMethodsLowercase, AuthenticationHeaderBox, BasicCredentialsStringBox, UrlEndingInSlashBox } from "@layer92/core";
import { Expect } from "@layer92/core";
export type OnAxiosHttpError = (statusCode:number,statusText:string,responseBodyData:any)=>(void|Promise<void>);

type RequestArgumentsBeyondMethod = {
    pathOnHost:string,
    body?:any,
    addHeaders?:{
        [key:string]:string,
    },
    addFormDataEntries?:[string,any][],
    onHttpError?:OnAxiosHttpError,
};

export class AxiosWebClient{

    constructor(private _needs:{
        baseUrlBox?: UrlEndingInSlashBox;
        customMethodImplementation?:"AppendWithColonThenPost",
        initialAuthenticationHeaderBox?:AuthenticationHeaderBox,
        onSetAuthenticationHeaderBoxAsync?:(maybeHeaderBox:AuthenticationHeaderBox|undefined)=>void|Promise<void>,
    }){
        if(this._needs.initialAuthenticationHeaderBox){
            this.setAuthenticationHeaderBox(this._needs.initialAuthenticationHeaderBox)
        }
    }
    readonly _axios = Axios.create({
        baseURL:this._needs.baseUrlBox?.getData()
    });


    /**
     * @returns the body data of the request
     * 
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    async requestAsync({
        method,
        pathOnHost,
        body,
        addHeaders,
        addFormDataEntries,
        onHttpError,
    }:{
        method:string
    }&RequestArgumentsBeyondMethod){
        if(pathOnHost.endsWith("/")){
            pathOnHost = pathOnHost.slice(0,-1);
        }
        const isCustomMethod = !AllHttpMethodsLowercase.includes(method);
        if( isCustomMethod ){
            if( this._needs.customMethodImplementation==="AppendWithColonThenPost" ){
                pathOnHost += ":"+method;
                method = "post";
            }else{
                if(!this._needs.customMethodImplementation){
                    throw new Error("Encountered a custom http method, but no implementation for that method was specified.");
                }
                throw new Error ("Not yet implemented: "+this._needs.customMethodImplementation);
            }
        }
        let headers = {
            ...(this._axios.defaults.headers as any),
            ...(addHeaders||{})
        };
        const isFileRequest = body instanceof Blob;
        if( isFileRequest && method==="post" ){
            const formData = new FormData();
            formData.append(`file`,body);
            body = formData;
            headers[`Content-Type`] = `multipart/form-data`;
        }
        if( body instanceof FormData ){
            for(const [key,value] of addFormDataEntries){
                body.append(key,value);
            }
            headers = {
                ...headers,
                ...((body as any).getHeaders?.()||{}),
            }
            // move file to end of form body, because some services require it to be at the end (such as AWS)
            // "The file or content must be the last field in the form." (https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-HTTPPOSTForms.html)
            const file:FormDataEntryValue = body.get(`file`);
            body.delete(`file`);
            body.append(`file`,file);
        }
        try{
            const axiosResult = await this._axios({
                method,
                url: pathOnHost,
                data: body,
                headers,
            });
            return axiosResult.data;
        }catch(axiosError:any){
            if( axiosError.response && axiosError.response.status){
                const {status:statusCode,statusText,data:responseBodyData} = axiosError.response;
                const path = (this._needs.baseUrlBox?.getData()||"")+pathOnHost;
                onHttpError?.(statusCode,statusText,responseBodyData);
                throw new Error("AxiosWebClient: AxiosError:\n"+JSON.stringify({path,method,statusCode,statusText,responseBodyData},null,4));
            }
            throw axiosError;
        }
    }
    /**
     * @returns the body data of the request
     * 
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    async getAsync(arguments_:RequestArgumentsBeyondMethod){
        return this.requestAsync({
            method:"get",
            ...arguments_
        })
    }
    /**
     * @returns the body data of the request
     * 
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    async postAsync(arguments_:RequestArgumentsBeyondMethod){
        return this.requestAsync({
            method:"post",
            ...arguments_
        })
    }
    /**
     * @returns the body data of the request
     * 
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    async patchAsync(arguments_:RequestArgumentsBeyondMethod){
        return this.requestAsync({
            method:"patch",
            ...arguments_
        })
    }
    /**
     * @returns the body data of the request
     * 
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    async putAsync(arguments_:RequestArgumentsBeyondMethod){
        return this.requestAsync({
            method:"put",
            ...arguments_
        })
    }
    /**
     * @returns the body data of the request
     * 
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    async deleteAsync(arguments_:RequestArgumentsBeyondMethod){
        return this.requestAsync({
            method:"delete",
            ...arguments_
        })
    }
    /**
     * @returns the body data of the request
     * 
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    async headAsync(arguments_:RequestArgumentsBeyondMethod){
        return this.requestAsync({
            method:"head",
            ...arguments_
        })
    }
    /**
     * @returns the body data of the request
     * 
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    async optionsAsync(arguments_:RequestArgumentsBeyondMethod){
        return this.requestAsync({
            method:"options",
            ...arguments_
        })
    }
    
    setBearerToken(token:string){
        const header = new AuthenticationHeaderBox("Bearer "+token);
        this.setAuthenticationHeaderBox(header);
    }

    maybeGetBearerToken(){
        const authorizationHeader = ""+this._axios.defaults.headers.Authorization;
        if(!authorizationHeader){
            return undefined;
        }
        Expect(authorizationHeader.startsWith("Bearer "),`Expected authorization header to start with "Bearer ". authorizationHeader: ${authorizationHeader}`);
        const token = authorizationHeader.split("Bearer ")[1];
        return token;
    }

    /**
     * @param basicCredentials a string in the form username:password
     */
    setBasicCredentialsString(basicCredentials:string){
        this.setBasicCredentialsStringBox(new BasicCredentialsStringBox(basicCredentials));
    }
    setBasicCredentialsStringBox(credentialsStringBox:BasicCredentialsStringBox){
        const header = credentialsStringBox.toBasicAuthorizationHeader();
        this.setAuthenticationHeaderBox(header);
    }

    /**
     * @param header A string in the form "Type value", eg "Basic username:password" or "Bearer foo". Despite going into the "Authorization" header of an HTTP request, this header is actually used for authentication, so that's what we're calling it.
     */
    setAuthenticationHeader(header:string){
        this.setAuthenticationHeaderBox(new AuthenticationHeaderBox(header));
    }
    setAuthenticationHeaderBox(headerBox:AuthenticationHeaderBox){
        this._axios.defaults.headers.Authorization = headerBox.getData();
        this._needs.onSetAuthenticationHeaderBoxAsync?.(headerBox);
    }

    clearAuthenticationCredentials(){
        delete this._axios.defaults.headers.Authorization;
        this._needs.onSetAuthenticationHeaderBoxAsync?.(undefined);
    }

    hasAuthenticationCredentials(){
        return !!this._axios.defaults.headers.Authorization;
    }
}

