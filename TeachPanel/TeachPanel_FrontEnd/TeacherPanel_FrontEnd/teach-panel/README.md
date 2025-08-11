# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# HTTPs setup

HTTPs is required to use since API use httpOnly cookies for authentication. To use HTTPs, you need to generate a self-signed certificate and key. You can do this using OpenSSL with the following command:

## MacOS/Linux

```bash
# Step: 1
# Install mkcert tool - macOS; you can see the mkcert repo for details
brew install mkcert

# Step: 2
# Install nss (only needed if you use Firefox)
brew install nss

# Step: 3
# Setup mkcert on your machine (creates a CA)
mkcert -install

# Step: 4 (Final)
# at the project root directory run the following command
mkdir -p .cert && mkcert -key-file ./.cert/key.pem -cert-file ./.cert/cert.pem 'localhost'

```

## Windows

```bash
choco install mkcert -y
mkcert -install
md .\cert
mkcert -key-file .\cert\key.pem -cert-file .\cert\cert.pem localhost 127.0.0.1 ::1
```

# Environment variables
Ensure you have the following environment variables set in your `.env` file:

```env
VITE_API_URL='https://localhost:7178/internal/'
VITE_PUBLIC_API_URL='https://localhost:7178/public/'
```

# Things TODO
- [ ] Add permission checks to the frontend
- [ ] Double check behaviour of frontend when 403 is returned from the backend (frontend updates query cache currently instead of showing error)
- [ ] Enrich details on backend API responses for activity view
- [ ] Show tag ids or fix backend search by tags to use names for public API