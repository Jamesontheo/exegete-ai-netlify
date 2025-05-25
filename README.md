# Exegete.AI - Scripture-First Reformed Theology Assistant

A Scripture-first Reformed theology assistant powered by Claude AI, designed to provide biblical answers grounded in Reformed doctrine and Westminster Standards.

## Features

- **Scripture-First Responses**: Every answer begins with relevant Bible verses
- **Reformed Theological Framework**: Grounded in TULIP, Covenant Theology, and Five Solas
- **Interactive Bible Reference**: Browse books, search verses, explore topics
- **Reformed Theologians**: Learn from Calvin, Luther, Augustine, Sproul, Piper, and more
- **Dark/Light Theme**: Toggle between themes for comfortable reading
- **Rate Limiting**: Built-in API protection with 50 requests per hour per IP
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Netlify Functions (Node.js)
- **AI**: Claude 3.5 Sonnet via Anthropic API
- **Hosting**: Netlify
- **Styling**: Custom CSS with Google Fonts (EB Garamond, Montserrat)

## Local Development

### Prerequisites

- Node.js 18+ 
- Netlify CLI
- Claude API key from Anthropic

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd exegete-ai-netlify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   CLAUDE_API_KEY=your_claude_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:8888`

### Development Commands

- `npm run dev` - Start Netlify dev server
- `npm run start` - Alias for dev command
- `npm run build` - Build for production (static site, no build step needed)
- `npm run deploy` - Deploy to Netlify production

## Deployment to Netlify

### Method 1: Netlify CLI (Recommended)

1. **Install Netlify CLI globally**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize site**
   ```bash
   netlify init
   ```

4. **Set environment variables**
   ```bash
   netlify env:set CLAUDE_API_KEY your_claude_api_key_here
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### Method 2: Git Integration

1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Connect your repository
   - Set build settings:
     - Build command: `echo 'No build step required'`
     - Publish directory: `.` (root)
     - Functions directory: `netlify/functions`

3. **Set environment variables**
   - Go to Site settings → Environment variables
   - Add `CLAUDE_API_KEY` with your API key

4. **Deploy**
   - Netlify will automatically deploy on git push

### Method 3: Manual Deploy

1. **Prepare files**
   - Ensure all files are ready
   - Set environment variables in Netlify dashboard

2. **Drag and drop**
   - Go to Netlify dashboard
   - Drag the entire project folder to deploy

## Environment Variables

The following environment variables are required:

- `CLAUDE_API_KEY` - Your Anthropic Claude API key

## API Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/chat` - Main chat endpoint for theological questions
- `GET /api/usage` - Check API usage and rate limits

## Rate Limiting

- 50 requests per hour per IP address
- Rate limits reset every hour
- Usage can be checked via `/api/usage` endpoint

## File Structure

```
exegete-ai-netlify/
├── index.html              # Main HTML file
├── css/
│   └── styles.css         # Main stylesheet
├── js/
│   ├── app.js            # Main application logic
│   └── config.js         # Configuration settings
├── netlify/
│   └── functions/        # Serverless functions
│       ├── chat.js       # Main chat API
│       ├── health.js     # Health check
│       └── usage.js      # Usage tracking
├── package.json          # Node.js dependencies
├── netlify.toml         # Netlify configuration
└── README.md           # This file
```

## Configuration

### API Configuration (js/config.js)

- Automatically detects environment (localhost vs production)
- Configurable timeouts and retry attempts
- Rate limiting settings
- UI themes and preferences

### Netlify Configuration (netlify.toml)

- Function settings and redirects
- Security headers
- Cache control for static assets
- CORS configuration

## Customization

### Themes

The app supports light and dark themes. Modify CSS custom properties in `css/styles.css`:

```css
:root {
    --primary-color: #14395b;
    --secondary-color: #9b2c2c;
    /* ... other variables */
}
```

### Theological Content

- **Topics**: Modify accordion content in `index.html`
- **Theologians**: Update theologian cards and data
- **Bible Books**: All 66 books are included by default
- **System Prompt**: Modify the AI behavior in `netlify/functions/chat.js`

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify your Claude API key is correct
   - Check environment variables are set properly
   - Ensure you have API credits available

2. **Functions Not Working Locally**
   - Make sure you're using `netlify dev` not a regular HTTP server
   - Check that functions are in `netlify/functions/` directory
   - Verify Node.js version is 18+

3. **CORS Issues**
   - Check `netlify.toml` CORS configuration
   - Ensure API endpoints are properly configured

4. **Rate Limiting**
   - Default is 50 requests/hour per IP
   - Modify limits in function files if needed
   - Check `/api/usage` for current usage

### Support

For issues and questions:
1. Check the browser console for errors
2. Verify all environment variables are set
3. Test API endpoints directly
4. Check Netlify function logs

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Acknowledgments

- **Anthropic** for Claude AI
- **Netlify** for hosting and serverless functions
- **Reformed Theologians** whose wisdom informs the responses
- **Scripture** as the ultimate authority for all theological content

---

*"All Scripture is breathed out by God and profitable for teaching, for reproof, for correction, and for training in righteousness" - 2 Timothy 3:16*
