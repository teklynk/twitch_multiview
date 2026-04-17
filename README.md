# Twitch Multi-Viewer

A lightweight web application that allows you to watch multiple Twitch streams simultaneously in a dynamic grid layout, featuring a tabbed chat sidebar.

## Features

- **Dynamic Grid**: Automatically scales and repositions video streams to fill the available screen space.
- **Tabbed Chat**: Switch between channel chats easily using a sidebar interface.

![screenshot](https://github.com/teklynk/twitch_multiview/blob/main/Screenshot%20from%202026-04-17%2002-30-57.png?raw=true)

## How to Use

### Getting Started
1. When you first open the app, you'll see a setup screen.
2. Enter the names of the Twitch channels you want to watch (separated by commas or spaces).
3. Click **GO**.

### URL Shortcuts
You can also load streams directly by adding them to the URL:
`https://your-domain.com/?channel=channel1,channel2,channel3`

## Local Development

This project is built using Vite, Bootstrap 5

### Prerequisites

- Node.js (Version 18.0.0 or higher)

### Installation

1. Clone the repository or extract the source files.
2. Open your terminal and navigate to the project folder:
   ```bash
   cd twitch_multiview
   ```
3. Install the required dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```
Once started, you can view the app in your browser at `http://localhost:5173`.

### Building for Production

To generate a production-ready build in the `dist/` folder:
```bash
npm run build
```