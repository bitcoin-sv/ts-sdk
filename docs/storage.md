# API

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

## Interfaces

| |
| --- |
| [DownloadResult](#interface-downloadresult) |
| [DownloaderConfig](#interface-downloaderconfig) |
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

See also: [WalletInterface](./wallet.md#interface-walletinterface)

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

See also: [DownloadResult](./storage.md#interface-downloadresult), [DownloaderConfig](./storage.md#interface-downloaderconfig)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Class: StorageUploader

```ts
export class StorageUploader {
    constructor(config: UploaderConfig) 
    public async publishFile(params: {
        file: UploadableFile;
        retentionPeriod: number;
    }): Promise<UploadFileResult> 
}
```

See also: [UploadFileResult](./storage.md#interface-uploadfileresult), [UploadableFile](./storage.md#interface-uploadablefile), [UploaderConfig](./storage.md#interface-uploaderconfig)

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
See also: [UploadFileResult](./storage.md#interface-uploadfileresult), [UploadableFile](./storage.md#interface-uploadablefile)

Returns

An object indicating whether the file was published successfully and the resulting UHRP URL.

Argument Details

+ **params.file**
  + An object describing the file’s data (number[] array of bytes) and mime type.
+ **params.retentionPeriod**
  + Number of minutes to keep the file hosted.

Throws

If either the upload info request or the subsequent file upload request fails (non-OK HTTP status).

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

See also: [fromBase58Check](./primitives.md#variable-frombase58check), [normalizeURL](./storage.md#variable-normalizeurl), [toHex](./primitives.md#variable-tohex)

Links: [API](#api), [Interfaces](#interfaces), [Classes](#classes), [Functions](#functions), [Types](#types), [Enums](#enums), [Variables](#variables)

---
### Variable: getURLForFile

```ts
getURLForFile = (file: number[]): string => {
    const hash = sha256(file);
    return getURLForHash(hash);
}
```

See also: [getURLForHash](./storage.md#variable-geturlforhash), [sha256](./primitives.md#variable-sha256)

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

See also: [toArray](./primitives.md#variable-toarray), [toBase58Check](./primitives.md#variable-tobase58check)

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

See also: [getHashFromURL](./storage.md#variable-gethashfromurl)

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
