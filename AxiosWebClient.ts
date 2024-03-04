import Axios from "axios";
import { AllHttpMethodsLowercase, AuthenticationHeaderBox, BasicCredentialsStringBox, UrlEndingInSlashBox } from "@layer92/core";
import { Expect } from "@layer92/core";

export type OnAxiosHttpError = ({statusCode,statusText,responseBodyData}:{statusCode:number,statusText:string,responseBodyData:any})=>void

export class AxiosWebClient{

    constructor(private _needs:{
        baseUrl?: UrlEndingInSlashBox;
        customMethodImplementation?:"AppendWithColonThenPost",
        initialAuthenticationHeader?:AuthenticationHeaderBox,
        onSetAuthenticationHeaderAsync?:(maybeHeader:AuthenticationHeaderBox|undefined)=>void|Promise<void>,
    }){
        if(this._needs.initialAuthenticationHeader){
            this.setAuthenticationHeader(this._needs.initialAuthenticationHeader)
        }
    }
    readonly _axios = Axios.create({
        baseURL:this._needs.baseUrl?.getData()
    });

    /**
     * @returns the body data of the request
     * */
    async requestAsync({
        method,
        pathOnHost,
        body,
        addHeaders,
        onHttpError,
    }:{
        method:string,
        pathOnHost:string,
        body?:any,
        addHeaders?:{
            [key:string]:string,
        },
        onHttpError?:OnAxiosHttpError,
    }){
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
        try{
            const axiosResult = await this._axios({
                method,
                url: pathOnHost,
                data: body,
                headers:{
                    ...(this._axios.defaults.headers as any),
                    ...(addHeaders||{})
                },
            });
            return axiosResult.data;
        }catch(axiosError:any){
            if( axiosError.response && axiosError.response.status){
                const {status:statusCode,statusText,data:responseBodyData} = axiosError.response;
                const path = (this._needs.baseUrl?.getData()||"")+pathOnHost;
                onHttpError?.({statusCode,statusText,responseBodyData});
                throw new Error("AxiosWebClient: AxiosError:\n"+JSON.stringify({path,method,statusCode,statusText,responseBodyData},null,4));
            }
            throw axiosError;
        }
    }
    
    setBearerToken(token:string){
        const header = new AuthenticationHeaderBox("Bearer "+token);
        this.setAuthenticationHeader(header);
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

    setBasicCredentials(credentialsStringBox:BasicCredentialsStringBox){
        const header = credentialsStringBox.toBasicAuthorizationHeader();
        this.setAuthenticationHeader(header);
    }

    setAuthenticationHeader(headerBox:AuthenticationHeaderBox){
        this._axios.defaults.headers.Authorization = headerBox.getData();
        this._needs.onSetAuthenticationHeaderAsync?.(headerBox);
    }

    clearAuthenticationCredentials(){
        delete this._axios.defaults.headers.Authorization;
        this._needs.onSetAuthenticationHeaderAsync?.(undefined);
    }

    hasAuthenticationCredentials(){
        return !!this._axios.defaults.headers.Authorization;
    }
}