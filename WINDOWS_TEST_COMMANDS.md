# Windows PowerShell Test Commands

## Install Dependencies (if not already installed)
```powershell
npm install
```

## Basic Test (Normal Mode)
```powershell
node index.js "https://t.me/proxy?server=163.5.31.10&port=8443&secret=EERighJJvXrFGRMCIMJdCQRueWVrdGFuZXQuY29tZmFyYWthdi5jb212YW4ubmFqdmEuY29tAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
```

## Test with Debug Mode (Detailed Output)
```powershell
node index.js --debug "https://t.me/proxy?server=163.5.31.10&port=8443&secret=EERighJJvXrFGRMCIMJdCQRueWVrdGFuZXQuY29tZmFyYWthdi5jb212YW4ubmFqdmEuY29tAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
```

## Test with tg:// format
```powershell
node index.js "tg://proxy?server=163.5.31.10&port=8443&secret=EERighJJvXrFGRMCIMJdCQRueWVrdGFuZXQuY29tZmFyYWthdi5jb212YW4ubmFqdmEuY29tAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
```

## Test from stdin (PowerShell)
```powershell
"https://t.me/proxy?server=163.5.31.10&port=8443&secret=EERighJJvXrFGRMCIMJdCQRueWVrdGFuZXQuY29tZmFyYWthdi5jb212YW4ubmFqdmEuY29tAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA" | node index.js
```

## Test with invalid proxy (to see error messages)
```powershell
node index.js "https://t.me/proxy?server=invalid.server.example&port=9999&secret=test"
```


