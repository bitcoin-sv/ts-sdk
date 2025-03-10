"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-env jest */
var MessageBoxClient_1 = __importDefault(require("../MessageBoxClient"));
var sdk_1 = require("@bsv/sdk");
var authsocket_1 = require("@bsv/authsocket");
jest.mock('@bsv/sdk', function () { return ({
    AuthFetch: jest.fn().mockImplementation(function () { return ({
        fetch: jest.fn().mockResolvedValue({ json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, ({})];
            }); }); } })
    }); }),
    WalletClient: jest.fn().mockImplementation(function () { return ({
        createHmac: jest.fn().mockResolvedValue({ hmac: new Uint8Array([1, 2, 3]) }),
        getPublicKey: jest.fn().mockResolvedValue({ publicKey: 'mockIdentityKey' })
    }); })
}); });
// ✅ Properly mock AuthSocketClient to return a fake WebSocket instance
var mockSocket = {
    on: jest.fn(),
    emit: jest.fn()
};
jest.mock('@bsv/authsocket', function () { return ({
    AuthSocketClient: jest.fn(function () { return mockSocket; }) // ✅ Returns our mock socket
}); });
describe('MessageBoxClient', function () {
    var mockWalletClient;
    beforeEach(function () {
        mockWalletClient = new sdk_1.WalletClient();
        jest.clearAllMocks(); // ✅ Reset all mocks to prevent test interference
    });
    var VALID_SEND_RESULT = {
        body: JSON.stringify({
            status: 200,
            message: 'Your message has been sent!'
        })
    };
    var VALID_LIST_AND_READ_RESULT = {
        body: JSON.stringify({
            status: 200,
            messages: [
                { sender: 'mockSender', messageBoxId: 42, body: '{}' },
                { sender: 'mockSender', messageBoxId: 43, body: '{}' }
            ]
        })
    };
    var VALID_ACK_RESULT = {
        body: JSON.stringify({
            status: 200,
            message: 'Messages marked as acknowledged!'
        })
    };
    it('Creates an instance of the MessageBoxClient class', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
            // Ensure the peerServHost property is set correctly
            expect(messageBoxClient).toHaveProperty('peerServHost', 'https://staging-peerserv.babbage.systems');
            // Ensure the socket is initialized as undefined before connecting
            expect(messageBoxClient.testSocket).toBeUndefined();
            return [2 /*return*/];
        });
    }); });
    it('Initializes WebSocket connection', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    return [4 /*yield*/, messageBoxClient.initializeConnection()];
                case 1:
                    _a.sent();
                    expect(authsocket_1.AuthSocketClient).toHaveBeenCalledWith('https://staging-peerserv.babbage.systems', expect.objectContaining({ wallet: mockWalletClient }));
                    return [2 /*return*/];
            }
        });
    }); });
    it('Throws an error when WebSocket connection is not initialized', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    // 🔹 Mock `initializeConnection` so it doesn't set up `this.socket`
                    jest.spyOn(messageBoxClient, 'initializeConnection').mockImplementation(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/];
                    }); }); });
                    return [4 /*yield*/, expect(messageBoxClient.sendLiveMessage({
                            recipient: 'mockIdentityKey',
                            messageBox: 'test_inbox',
                            body: 'Test message'
                        })).rejects.toThrow('WebSocket connection not initialized')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Listens for live messages', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient, mockOnMessage;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    return [4 /*yield*/, messageBoxClient.initializeConnection()];
                case 1:
                    _b.sent();
                    mockOnMessage = jest.fn();
                    return [4 /*yield*/, messageBoxClient.listenForLiveMessages({ messageBox: 'test_inbox', onMessage: mockOnMessage })];
                case 2:
                    _b.sent();
                    expect((_a = messageBoxClient.testSocket) === null || _a === void 0 ? void 0 : _a.emit).toHaveBeenCalledWith('joinRoom', 'mockIdentityKey-test_inbox');
                    return [2 /*return*/];
            }
        });
    }); });
    it('Sends a live message', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient, emitSpy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    return [4 /*yield*/, messageBoxClient.initializeConnection()
                        // Spy on the emit function of the testSocket
                    ];
                case 1:
                    _a.sent();
                    emitSpy = jest.spyOn(messageBoxClient.testSocket, 'emit');
                    return [4 /*yield*/, messageBoxClient.sendLiveMessage({
                            recipient: 'mockIdentityKey',
                            messageBox: 'test_inbox',
                            body: 'Test message'
                        })];
                case 2:
                    _a.sent();
                    expect(emitSpy).toHaveBeenCalledWith('sendMessage', expect.objectContaining({
                        roomId: 'mockIdentityKey-test_inbox',
                        message: expect.objectContaining({ body: 'Test message' })
                    }));
                    return [2 /*return*/];
            }
        });
    }); });
    it('Sends a message', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    jest.spyOn(messageBoxClient.authFetch, 'fetch').mockResolvedValue({
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, JSON.parse(VALID_SEND_RESULT.body)];
                        }); }); },
                        headers: new Headers(),
                        ok: true,
                        status: 200
                    });
                    return [4 /*yield*/, messageBoxClient.sendMessage({
                            recipient: 'mockIdentityKey',
                            messageBox: 'test_inbox',
                            body: { data: 'test' }
                        })];
                case 1:
                    result = _a.sent();
                    expect(result).toHaveProperty('message', 'Your message has been sent!');
                    return [2 /*return*/];
            }
        });
    }); });
    it('Lists available messages', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    jest.spyOn(messageBoxClient.authFetch, 'fetch').mockResolvedValue({
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, JSON.parse(VALID_LIST_AND_READ_RESULT.body)];
                        }); }); },
                        headers: new Headers(),
                        ok: true,
                        status: 200
                    });
                    return [4 /*yield*/, messageBoxClient.listMessages({ messageBox: 'test_inbox' })];
                case 1:
                    result = _a.sent();
                    expect(result).toEqual(JSON.parse(VALID_LIST_AND_READ_RESULT.body).messages);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Acknowledges a message', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    jest.spyOn(messageBoxClient.authFetch, 'fetch').mockResolvedValue({
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, JSON.parse(VALID_ACK_RESULT.body)];
                        }); }); },
                        headers: new Headers(),
                        ok: true,
                        status: 200
                    });
                    return [4 /*yield*/, messageBoxClient.acknowledgeMessage({ messageIds: ['42'] })];
                case 1:
                    result = _a.sent();
                    expect(result).toEqual(200);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Throws an error when sendMessage() API fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    jest.spyOn(messageBoxClient.authFetch, 'fetch')
                        .mockResolvedValue({
                        status: 500,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ status: 'error', description: 'Internal Server Error' })];
                        }); }); }
                    });
                    return [4 /*yield*/, expect(messageBoxClient.sendMessage({
                            recipient: 'mockIdentityKey',
                            messageBox: 'test_inbox',
                            body: 'Test Message'
                        })).rejects.toThrow('Internal Server Error')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Throws an error when listMessages() API fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    jest.spyOn(messageBoxClient.authFetch, 'fetch')
                        .mockResolvedValue({
                        status: 500,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ status: 'error', description: 'Failed to fetch messages' })];
                        }); }); }
                    });
                    return [4 /*yield*/, expect(messageBoxClient.listMessages({ messageBox: 'test_inbox' }))
                            .rejects.toThrow('Failed to fetch messages')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Throws an error when acknowledgeMessage() API fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    jest.spyOn(messageBoxClient.authFetch, 'fetch')
                        .mockResolvedValue({
                        status: 500,
                        json: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                            return [2 /*return*/, ({ status: 'error', description: 'Failed to acknowledge messages' })];
                        }); }); }
                    });
                    return [4 /*yield*/, expect(messageBoxClient.acknowledgeMessage({ messageIds: ['42'] }))
                            .rejects.toThrow('Failed to acknowledge messages')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Throws an error when identity key is missing', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    // Mock `getPublicKey` to return an empty key
                    jest.spyOn(mockWalletClient, 'getPublicKey').mockResolvedValue({ publicKey: '' });
                    return [4 /*yield*/, expect(messageBoxClient.initializeConnection()).rejects.toThrow('Identity key is missing')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Initializes WebSocket connection only once', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient, authSocketMock;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    // ✅ Ensure `getPublicKey` always returns a valid identity key
                    jest.spyOn(mockWalletClient, 'getPublicKey').mockResolvedValue({ publicKey: 'mockIdentityKey' });
                    authSocketMock = { on: jest.fn(), emit: jest.fn() };
                    authsocket_1.AuthSocketClient.mockReturnValue(authSocketMock);
                    return [4 /*yield*/, messageBoxClient.initializeConnection()
                        // ✅ Ensure WebSocket connection initializes once
                    ];
                case 1:
                    _a.sent();
                    // ✅ Ensure WebSocket connection initializes once
                    expect(authsocket_1.AuthSocketClient).toHaveBeenCalledTimes(1);
                    // 🔥 Call `initializeConnection` again (should NOT create another socket)
                    return [4 /*yield*/, messageBoxClient.initializeConnection()
                        // ✅ Ensure it's still only called once
                    ];
                case 2:
                    // 🔥 Call `initializeConnection` again (should NOT create another socket)
                    _a.sent();
                    // ✅ Ensure it's still only called once
                    expect(authsocket_1.AuthSocketClient).toHaveBeenCalledTimes(1);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Throws an error when WebSocket is not initialized before listening for messages', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    // Mock `initializeConnection` so it doesn't set up WebSocket
                    jest.spyOn(messageBoxClient, 'initializeConnection').mockImplementation(function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/];
                    }); }); });
                    return [4 /*yield*/, expect(messageBoxClient.listenForLiveMessages({
                            onMessage: jest.fn(),
                            messageBox: 'test_inbox'
                        })).rejects.toThrow('WebSocket connection not initialized')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('Emits joinRoom event and listens for incoming messages', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient, mockSocket, onMessageMock, receivedMessage, sendMessageCallback;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    // Mock identity key properly
                    jest.spyOn(mockWalletClient, 'getPublicKey').mockResolvedValue({ publicKey: 'mockIdentityKey' });
                    mockSocket = {
                        emit: jest.fn(),
                        on: jest.fn()
                    };
                    // Mock `initializeConnection` so it assigns `socket` & identity key
                    jest.spyOn(messageBoxClient, 'initializeConnection').mockImplementation(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            Object.defineProperty(messageBoxClient, 'testIdentityKey', { get: function () { return 'mockIdentityKey'; } });
                            Object.defineProperty(messageBoxClient, 'testSocket', { get: function () { return mockSocket; } });
                            messageBoxClient.socket = mockSocket; // Ensures internal socket is set
                            messageBoxClient.myIdentityKey = 'mockIdentityKey'; // Ensures identity key is set
                            return [2 /*return*/];
                        });
                    }); });
                    onMessageMock = jest.fn();
                    return [4 /*yield*/, messageBoxClient.listenForLiveMessages({
                            onMessage: onMessageMock,
                            messageBox: 'test_inbox'
                        })
                        // ✅ Ensure `joinRoom` event was emitted with the correct identity key
                    ];
                case 1:
                    _b.sent();
                    // ✅ Ensure `joinRoom` event was emitted with the correct identity key
                    expect(mockSocket.emit).toHaveBeenCalledWith('joinRoom', 'mockIdentityKey-test_inbox');
                    receivedMessage = { text: 'Hello, world!' };
                    sendMessageCallback = (_a = mockSocket.on.mock.calls.find(function (_a) {
                        var eventName = _a[0];
                        return eventName === 'sendMessage-mockIdentityKey-test_inbox';
                    })) === null || _a === void 0 ? void 0 : _a[1] // Extract the callback function
                    ;
                    if (typeof sendMessageCallback === 'function') {
                        sendMessageCallback(receivedMessage);
                    }
                    // ✅ Ensure `onMessage` was called with the received message
                    expect(onMessageMock).toHaveBeenCalledWith(receivedMessage);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Handles WebSocket connection and disconnection events', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient, mockSocket, consoleLogSpy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    // Mock `getPublicKey` to return a valid key
                    jest.spyOn(mockWalletClient, 'getPublicKey').mockResolvedValue({ publicKey: 'mockIdentityKey' });
                    mockSocket = {
                        on: jest.fn(function (event, callback) {
                            if (event === 'connect')
                                callback();
                            if (event === 'disconnect')
                                callback();
                        }),
                        emit: jest.fn()
                    };
                    authsocket_1.AuthSocketClient.mockReturnValue(mockSocket);
                    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
                    return [4 /*yield*/, messageBoxClient.initializeConnection()
                        // Ensure event listeners were set up
                    ];
                case 1:
                    _a.sent();
                    // Ensure event listeners were set up
                    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
                    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
                    // Ensure correct console logs were triggered
                    expect(consoleLogSpy).toHaveBeenCalledWith('Connected to MessageBox server via WebSocket');
                    expect(consoleLogSpy).toHaveBeenCalledWith('Disconnected from MessageBox server');
                    // Restore console.log
                    consoleLogSpy.mockRestore();
                    return [2 /*return*/];
            }
        });
    }); });
    it('throws an error when recipient is empty in sendLiveMessage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient, mockSocket;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    // Mock `initializeConnection` so it assigns `socket` & identity key
                    jest.spyOn(messageBoxClient, 'initializeConnection').mockImplementation(function () { return __awaiter(void 0, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            Object.defineProperty(messageBoxClient, 'testIdentityKey', { get: function () { return 'mockIdentityKey'; } });
                            Object.defineProperty(messageBoxClient, 'testSocket', { get: function () { return mockSocket; } });
                            messageBoxClient.socket = mockSocket; // Ensures internal socket is set
                            messageBoxClient.myIdentityKey = 'mockIdentityKey'; // Ensures identity key is set
                            return [2 /*return*/];
                        });
                    }); });
                    mockSocket = {
                        emit: jest.fn()
                    };
                    jest.spyOn(messageBoxClient, 'testSocket', 'get').mockReturnValue(mockSocket);
                    return [4 /*yield*/, expect(messageBoxClient.sendLiveMessage({
                            recipient: '  ', // Empty recipient (whitespace)
                            messageBox: 'test_inbox',
                            body: 'Test message'
                        })).rejects.toThrow('Recipient cannot be empty')];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('throws an error when recipient is missing in sendMessage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    return [4 /*yield*/, expect(messageBoxClient.sendMessage({
                            recipient: '', // Empty recipient
                            messageBox: 'test_inbox',
                            body: 'Test message'
                        })).rejects.toThrow('You must provide a message recipient!')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expect(messageBoxClient.sendMessage({
                            recipient: '   ', // Whitespace recipient
                            messageBox: 'test_inbox',
                            body: 'Test message'
                        })).rejects.toThrow('You must provide a message recipient!')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, expect(messageBoxClient.sendMessage({
                            recipient: null, // Null recipient
                            messageBox: 'test_inbox',
                            body: 'Test message'
                        })).rejects.toThrow('You must provide a message recipient!')];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('throws an error when messageBox is missing in sendMessage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    return [4 /*yield*/, expect(messageBoxClient.sendMessage({
                            recipient: 'mockIdentityKey',
                            messageBox: '', // Empty messageBox
                            body: 'Test message'
                        })).rejects.toThrow('You must provide a messageBox to send this message into!')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expect(messageBoxClient.sendMessage({
                            recipient: 'mockIdentityKey',
                            messageBox: '   ', // Whitespace messageBox
                            body: 'Test message'
                        })).rejects.toThrow('You must provide a messageBox to send this message into!')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, expect(messageBoxClient.sendMessage({
                            recipient: 'mockIdentityKey',
                            messageBox: null, // Null messageBox
                            body: 'Test message'
                        })).rejects.toThrow('You must provide a messageBox to send this message into!')];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('throws an error when message body is missing in sendMessage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    return [4 /*yield*/, expect(messageBoxClient.sendMessage({
                            recipient: 'mockIdentityKey',
                            messageBox: 'test_inbox',
                            body: '' // Empty body
                        })).rejects.toThrow('Every message must have a body!')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expect(messageBoxClient.sendMessage({
                            recipient: 'mockIdentityKey',
                            messageBox: 'test_inbox',
                            body: '   ' // Whitespace body
                        })).rejects.toThrow('Every message must have a body!')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, expect(messageBoxClient.sendMessage({
                            recipient: 'mockIdentityKey',
                            messageBox: 'test_inbox',
                            body: null // Null body
                        })).rejects.toThrow('Every message must have a body!')];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('throws an error when messageBox is empty in listMessages', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    return [4 /*yield*/, expect(messageBoxClient.listMessages({
                            messageBox: '' // Empty messageBox
                        })).rejects.toThrow('MessageBox cannot be empty')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expect(messageBoxClient.listMessages({
                            messageBox: '   ' // Whitespace messageBox
                        })).rejects.toThrow('MessageBox cannot be empty')];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('throws an error when messageIds is empty in acknowledgeMessage', function () { return __awaiter(void 0, void 0, void 0, function () {
        var messageBoxClient;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    messageBoxClient = new MessageBoxClient_1.default({ walletClient: mockWalletClient });
                    return [4 /*yield*/, expect(messageBoxClient.acknowledgeMessage({
                            messageIds: [] // Empty array
                        })).rejects.toThrow('Message IDs array cannot be empty')];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, expect(messageBoxClient.acknowledgeMessage({
                            messageIds: undefined // Undefined value
                        })).rejects.toThrow('Message IDs array cannot be empty')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, expect(messageBoxClient.acknowledgeMessage({
                            messageIds: null // Null value
                        })).rejects.toThrow('Message IDs array cannot be empty')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, expect(messageBoxClient.acknowledgeMessage({
                            messageIds: 'invalid' // Not an array
                        })).rejects.toThrow('Message IDs array cannot be empty')];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
});
