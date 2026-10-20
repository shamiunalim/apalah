# Maxiel Domain Control

Aplikasi statis untuk GitHub Pages yang mengelola nama internal berakhiran `.tex` dan mengalihkan nama yang telah dipublikasikan ke URL HTTPS.

## Batasan penting

- `.tex` di aplikasi ini hanyalah nama dalam database JSON aplikasi. Ini BUKAN TLD/domain DNS global dan `maxiel.tex` tidak akan bisa diketik langsung di browser umum.
- Tidak ada backend atau database server. Draft disimpan di `localStorage` browser admin.
- Untuk memublikasikan perubahan, ekspor `domains.json` lalu unggah/ganti file itu di root repository GitHub. Setelah Pages selesai diperbarui, semua pengunjung membaca daftar publik yang sama.
- Link pengalihan berbentuk `https://USERNAME.github.io/REPO/?go=maxiel` (atau path Pages yang sesuai). Pengunjung kemudian dialihkan ke URL tujuan. URL browser akan berubah ke tujuan.
- Aplikasi ini tidak mendaftarkan domain, tidak mengendalikan DNS, dan tidak membuat `.com`, `.id`, atau `.tex` menjadi domain internet global.
- Tidak ada login admin sungguhan. Lindungi akses tulis repository GitHub dan jangan menaruh token rahasia di source code.

## Deploy melalui Android

1. Buat repository baru, misalnya `maxiel-domain-control`.
2. Unggah semua file paket ini ke root repository: `index.html`, `style.css`, `app.js`, `domains.json`, `README.md`.
3. Di repository, buka **Settings → Pages**.
4. Pilih **Deploy from a branch**, branch `main`, folder `/(root)`, lalu Save.
5. Tunggu URL GitHub Pages tampil di bagian Pages.
6. Buka URL itu. Tambahkan nama dan URL HTTPS tujuan, lalu tekan **Ekspor domains.json**.
7. Unggah file `domains.json` hasil ekspor untuk mengganti file lama di repository dan commit perubahan.
8. Setelah Pages diperbarui, link publik untuk `maxiel` ialah URL Pages ditambah `?go=maxiel`, contoh `https://USERNAME.github.io/REPO/?go=maxiel`.

## Mengubah/menghapus nama publik

Edit atau hapus record yang sesuai dalam `domains.json` melalui aplikasi lalu ekspor, atau edit JSON di GitHub secara langsung. Perubahan baru aktif setelah commit dan deployment Pages selesai.

## Skema domains.json

```json
{
  "version": 1,
  "domains": [
    {
      "id": "maxiel",
      "name": "maxiel",
      "target": "https://username.github.io/project/",
      "description": "Website utama Maxiel"
    }
  ]
}
```

Gunakan URL HTTPS yang valid. Hanya masukkan tujuan yang kamu miliki atau berwenang mengarahkannya.
