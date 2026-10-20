# Maxiel-Xy — Baileys v7 fork

Ini adalah source lengkap Baileys v7.0.0-rc14 yang metadata paket root-nya disesuaikan menjadi `maxiel-xy`. Lisensi MIT dan atribusi upstream tetap dipertahankan.

## Build
Memerlukan Node.js >= 20 dan npm:
```bash
npm install
npm run build
```

## API
Source root `src/index.ts` mengekspor `makeWASocket` sebagai default dan named export, serta mengekspor API dari WAProto, Utils, Types, Defaults, WABinary, WAM, dan WAUSync. Fungsi yang tersedia mengikuti source upstream versi ini; tidak semua API Baileys v6 dijamin masih tersedia pada v7.

## Pakai di bot
Setelah source ini diunggah ke repo GitHub `shamiunalim/Maxbail` dan commit:
```bash
npm uninstall maxiel-xy
npm install github:shamiunalim/Maxbail
```
Restart/rebuild bot setelah instalasi. Untuk memastikan paket terpasang dari repo yang benar, periksa `node_modules/maxiel-xy/package.json` dan `src/index.ts` pada repo.

## Catatan penting
- Ini source fork, bukan jaminan koneksi WhatsApp 24/7. Bot tetap perlu supervisor/restart policy di hosting dan penanganan disconnect.
- Pairing code harus dipanggil dari implementasi bot dengan `sock.requestPairingCode(...)` setelah socket siap sesuai API versi ini.
- Jangan gunakan satu folder sesi yang sama dari dua proses bot sekaligus.
- Error Signal seperti `Over 2000 messages into the future` tidak otomatis diselesaikan dengan mengganti nama paket; cek versi Node, versi library, dan sesi yang digunakan.
- Baileys v7 memiliki breaking changes. Uji plugin Nyla satu per satu sebelum mengganti library produksi.
