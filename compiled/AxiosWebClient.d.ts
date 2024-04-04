import { AuthenticationHeaderBox, BasicCredentialsStringBox, UrlEndingInSlashBox } from "@layer92/core";
export type OnAxiosHttpError = (statusCode: number, statusText: string, responseBodyData: any) => (void | Promise<void>);
type RequestArgumentsBeyondMethod = {
    pathOnHost: string;
    body?: any;
    addHeaders?: {
        [key: string]: string;
    };
    addFormDataEntries?: [string, any][];
    onHttpError?: OnAxiosHttpError;
};
export declare class AxiosWebClient {
    private _needs;
    constructor(_needs: {
        baseUrlBox?: UrlEndingInSlashBox;
        customMethodImplementation?: "AppendWithColonThenPost";
        initialAuthenticationHeaderBox?: AuthenticationHeaderBox;
        onSetAuthenticationHeaderBoxAsync?: (maybeHeaderBox: AuthenticationHeaderBox | undefined) => void | Promise<void>;
    });
    readonly _axios: import("axios").AxiosInstance;
    /**
     * @returns the body data of the request
     *
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    requestAsync({ method, pathOnHost, body, addHeaders, addFormDataEntries, onHttpError, }: {
        method: string;
    } & RequestArgumentsBeyondMethod): Promise<any>;
    /**
     * @returns the body data of the request
     *
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    getAsync(arguments_: RequestArgumentsBeyondMethod): Promise<any>;
    /**
     * @returns the body data of the request
     *
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    postAsync(arguments_: RequestArgumentsBeyondMethod): Promise<any>;
    /**
     * @returns the body data of the request
     *
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    patchAsync(arguments_: RequestArgumentsBeyondMethod): Promise<any>;
    /**
     * @returns the body data of the request
     *
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    putAsync(arguments_: RequestArgumentsBeyondMethod): Promise<any>;
    /**
     * @returns the body data of the request
     *
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    deleteAsync(arguments_: RequestArgumentsBeyondMethod): Promise<any>;
    /**
     * @returns the body data of the request
     *
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    headAsync(arguments_: RequestArgumentsBeyondMethod): Promise<any>;
    /**
     * @returns the body data of the request
     *
     * @param 0.body: you can provide a File (or Blob) as the body if you'd like to submit a file. If you're POSTing a file, the request body will become multi-part FormData
     * */
    optionsAsync(arguments_: RequestArgumentsBeyondMethod): Promise<any>;
    setBearerToken(token: string): void;
    maybeGetBearerToken(): string;
    /**
     * @param basicCredentials a string in the form username:password
     */
    setBasicCredentialsString(basicCredentials: string): void;
    setBasicCredentialsStringBox(credentialsStringBox: BasicCredentialsStringBox): void;
    /**
     * @param header A string in the form "Type value", eg "Basic username:password" or "Bearer foo". Despite going into the "Authorization" header of an HTTP request, this header is actually used for authentication, so that's what we're calling it.
     */
    setAuthenticationHeader(header: string): void;
    setAuthenticationHeaderBox(headerBox: AuthenticationHeaderBox): void;
    clearAuthenticationCredentials(): void;
    hasAuthenticationCredentials(): boolean;
}
export {};
