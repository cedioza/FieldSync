"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var cors_1 = require("cors");
var path_1 = require("path");
var client_1 = require("@prisma/client");
var app = (0, express_1.default)();
var prisma = new client_1.PrismaClient();
var PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// API Routes
// GET /api/orders
app.get('/api/orders', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var orders, formattedOrders, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.workOrder.findMany({
                        include: {
                            photos: true,
                            workReport: true,
                        },
                        orderBy: { created: 'desc' }
                    })];
            case 1:
                orders = _a.sent();
                formattedOrders = orders.map(function (o) { return (__assign(__assign({}, o), { equipment: JSON.parse(o.equipment), mopItems: JSON.parse(o.mopItems), photos: o.photos.reduce(function (acc, photo) {
                        acc[photo.key] = photo;
                        return acc;
                    }, {}) })); });
                res.json(formattedOrders);
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('Error fetching orders:', error_1);
                res.status(500).json({ error: 'Failed to fetch orders' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// POST /api/orders
app.post('/api/orders', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, newOrder, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                data = req.body;
                return [4 /*yield*/, prisma.workOrder.create({
                        data: {
                            id: data.id,
                            type: data.type,
                            siteType: data.siteType,
                            region: data.region,
                            title: data.title,
                            location: data.location,
                            partner: data.partner,
                            address: data.address,
                            lat: data.lat,
                            lng: data.lng,
                            status: data.status,
                            contractor: data.contractor,
                            assignedTech: data.assignedTech,
                            equipment: JSON.stringify(data.equipment || []),
                            task: data.task,
                            mopItems: JSON.stringify(data.mopItems || []),
                            hours: data.hours || 0,
                            travelHours: data.travelHours || 0,
                            apEngineer: data.apEngineer || 'System API',
                            apPhone: data.apPhone || '(555) 000-0000',
                        }
                    })];
            case 1:
                newOrder = _a.sent();
                res.status(201).json(__assign(__assign({}, newOrder), { equipment: [], mopItems: [], photos: {} }));
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error creating order:', error_2);
                res.status(500).json({ error: 'Failed to create order' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// PUT /api/orders/:id/status
app.put('/api/orders/:id/status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, status_1, contractor, updated, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, status_1 = _a.status, contractor = _a.contractor;
                return [4 /*yield*/, prisma.workOrder.update({
                        where: { id: id },
                        data: __assign({ status: status_1 }, (contractor ? { contractor: contractor } : {}))
                    })];
            case 1:
                updated = _b.sent();
                res.json(updated);
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                res.status(500).json({ error: 'Failed to update order status' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// GET /api/technicians
app.get('/api/technicians', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var techs, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma.technician.findMany()];
            case 1:
                techs = _a.sent();
                res.json(techs);
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                res.status(500).json({ error: 'Failed to fetch technicians' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Serve frontend build (For Docker Production Environment)
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
app.get('*', function (req, res) {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
// Server boot
app.listen(PORT, function () {
    console.log("[FieldSync] Backend listening on port ".concat(PORT, " \u26A1"));
});
