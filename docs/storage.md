# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

## Interfaces

| |
| --- |
| [DownloadResult](#interface-downloadresult) |
| [DownloaderConfig](#interface-downloaderconfig) |
| [FindFileData](#interface-findfiledata) |
| [RenewFileResult](#interface-renewfileresult) |
| [UploadFileResult](#interface-uploadfileresult) |
| [UploadableFile](#interface-uploadablefile) |
| [UploaderConfig](#interface-uploaderconfig) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Interface: DownloadResult

```ts
export interface DownloadResult {
    data: number[];
    mimeType: string | null;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: DownloaderConfig

```ts
export interface DownloaderConfig {
    networkPreset: "mainnet" | "testnet" | "local";
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: FindFileData

```ts
export interface FindFileData {
    name: string;
    size: string;
    mimeType: string;
    expiryTime: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: RenewFileResult

```ts
export interface RenewFileResult {
    status: string;
    prevExpiryTime?: number;
    newExpiryTime?: number;
    amount?: number;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: UploadFileResult

```ts
export interface UploadFileResult {
    published: boolean;
    uhrpURL: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: UploadableFile

```ts
export interface UploadableFile {
    data: number[];
    type: string;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Interface: UploaderConfig

```ts
export interface UploaderConfig {
    storageURL: string;
    wallet: WalletInterface;
}
```

See also: [WalletInterface](#interface-walletinterface)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Classes

| |
| --- |
| [StorageDownloader](#class-storagedownloader) |
| [StorageUploader](#class-storageuploader) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Class: StorageDownloader

Locates HTTP URLs where content can be downloaded. It uses the passed or the default one.

```ts
export class StorageDownloader {
    constructor(config?: DownloaderConfig) 
    public async resolve(uhrpUrl: string): Promise<string[]> 
    public async download(uhrpUrl: string): Promise<DownloadResult> 
}
```

See also: [DownloadResult](#interface-downloadresult), [DownloaderConfig](#interface-downloaderconfig)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: StorageUploader

The StorageUploader class provides client-side methods for:
- Uploading files with a specified retention period
- Finding file metadata by UHRP URL
- Listing all user uploads
- Renewing an existing advertisement's expiry time

```ts
export class StorageUploader {
    constructor(config: UploaderConfig) 
    public async publishFile(params: {
        file: UploadableFile;
        retentionPeriod: number;
    }): Promise<UploadFileResult> 
    public async findFile(uhrpUrl: string): Promise<FindFileData> 
    public async listUploads(): Promise<any> 
    public async renewFile(uhrpUrl: string, additionalMinutes: number): Promise<RenewFileResult> 
}
```

See also: [FindFileData](#interface-findfiledata), [RenewFileResult](#interface-renewfileresult), [UploadFileResult](#interface-uploadfileresult), [UploadableFile](#interface-uploadablefile), [UploaderConfig](#interface-uploaderconfig)

<details>

<summary>Class StorageUploader Details</summary>

#### Constructor

Creates a new StorageUploader instance.

```ts
constructor(config: UploaderConfig) 
```
See also: [UploaderConfig](#interface-uploaderconfig)

Argument Details

+ **config**
  + An object containing the storage server's URL and a wallet interface

#### Method findFile

Retrieves metadata for a file matching the given UHRP URL from the `/find` route.

```ts
public async findFile(uhrpUrl: string): Promise<FindFileData> 
```
See also: [FindFileData](#interface-findfiledata)

Returns

An object with file name, size, MIME type, and expiry time

Argument Details

+ **uhrpUrl**
  + The UHRP URL, e.g. "uhrp://abcd..."

Throws

If the server or the route returns an error

#### Method listUploads

Lists all advertisements belonging to the user from the `/list` route.

```ts
public async listUploads(): Promise<any> 
```

Returns

The array of uploads returned by the server

Throws

If the server or the route returns an error

#### Method publishFile

Publishes a file to the storage server with the specified retention period.

This will:
1. Request an upload URL from the server.
2. Perform an HTTP PUT to upload the file’s raw bytes.
3. Return a UHRP URL referencing the file once published.

```ts
public async publishFile(params: {
    file: UploadableFile;
    retentionPeriod: number;
}): Promise<UploadFileResult> 
```
See also: [UploadFileResult](#interface-uploadfileresult), [UploadableFile](#interface-uploadablefile)

Returns

An object with the file's UHRP URL

Throws

If the server or upload step returns a non-OK response

#### Method renewFile

Renews the hosting time for an existing file advertisement identified by uhrpUrl.
Calls the `/renew` route to add `additionalMinutes` to the GCS customTime
and re-mint the advertisement token on-chain.

```ts
public async renewFile(uhrpUrl: string, additionalMinutes: number): Promise<RenewFileResult> 
```
See also: [RenewFileResult](#interface-renewfileresult)

Returns

An object with the new and previous expiry times, plus any cost

Argument Details

+ **uhrpUrl**
  + The UHRP URL of the file (e.g., "uhrp://abcd1234...")
+ **additionalMinutes**
  + The number of minutes to extend

Throws

If the request fails or the server returns an error

</details>

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
## Functions

## Types

## Enums

## Variables

| |
| --- |
| [getHashFromURL](#variable-gethashfromurl) |
| [getURLForFile](#variable-geturlforfile) |
| [getURLForHash](#variable-geturlforhash) |
| [isValidURL](#variable-isvalidurl) |
| [normalizeURL](#variable-normalizeurl) |

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---

### Variable: getHashFromURL

```ts
getHashFromURL = (URL: string): number[] => {
    URL = normalizeURL(URL);
    const { data, prefix } = fromBase58Check(URL, undefined, 2);
    if (data.length !== 32) {
        throw new Error("Invalid length!");
    }
    if (toHex(prefix as number[]) !== "ce00") {
        throw new Error("Bad prefix");
    }
    return data as number[];
}
```

See also: [fromBase58Check](#variable-frombase58check), [normalizeURL](#variable-normalizeurl), [toHex](#variable-tohex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Variable: getURLForFile

```ts
getURLForFile = (file: number[]): string => {
    const hash = sha256(file);
    return getURLForHash(hash);
}
```

See also: [getURLForHash](#variable-geturlforhash), [sha256](#variable-sha256)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Variable: getURLForHash

```ts
getURLForHash = (hash: number[]): string => {
    if (hash.length !== 32) {
        throw new Error("Hash length must be 32 bytes (sha256)");
    }
    return toBase58Check(hash, toArray("ce00", "hex"));
}
```

See also: [toArray](#variable-toarray), [toBase58Check](#variable-tobase58check)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Variable: isValidURL

```ts
isValidURL = (URL: string): boolean => {
    try {
        getHashFromURL(URL);
        return true;
    }
    catch (e) {
        return false;
    }
}
```

See also: [getHashFromURL](#variable-gethashfromurl)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Variable: normalizeURL

```ts
normalizeURL = (URL: string): string => {
    if (URL.toLowerCase().startsWith("uhrp:"))
        URL = URL.slice(5);
    if (URL.startsWith("//"))
        URL = URL.slice(2);
    return URL;
}
```

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
