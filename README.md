# TruckersMP Stats

A comprehensive web application for viewing TruckersMP statistics, server information, events, and player data using the official TruckersMP API.

## 🚛 Features

### 🌐 Server Information
- Real-time server status and player counts
- Server details including game type, collision settings, and special events
- Queue information and maximum capacity
- Speed limiter and AFK kick status
- ProMods and special event server identification

### 📅 Events
- Browse upcoming TruckersMP events
- Event details including departure/arrival locations
- Attendee information and VTC participation
- Event rules and requirements
- Required DLC information

### 📰 News
- Latest TruckersMP news and announcements
- VTC news and updates
- Pinned articles and content summaries

### 🏢 Virtual Trucking Companies (VTCs)
- Browse and search VTCs
- Company information including member counts
- VTC verification and validation status
- Social media links and company details
- Member listings and role information
- Recruitment status and language information

### 🔍 Player Search
- Search for individual players by name or ID
- Comprehensive player profiles including:
  - Player statistics and join date
  - Ban information and status
  - VTC membership and history
  - Achievements and awards
  - Patreon status and permissions
  - Discord integration status

### 📋 Rules
- Current in-game rules
- Rule revision tracking
- Markdown formatted content

## 🛠️ Tech Stack

- **Frontend**: React/Next.js
- **API**: TruckersMP Public API
- **Styling**: TailwindCSS, Shadcn
- **Language**: Typescript, Javascript

## 🚀 Getting Started

### Prerequisites

- Node.js
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone https://github.com/HarmanPreet-Singh-XYT/truckersmp.git
cd truckersmp
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🔧 API Integration

This application uses the official TruckersMP API to fetch real-time data. The API provides information about:

- Server status and player counts
- Player profiles and statistics
- Virtual Trucking Companies
- Events and convoys
- Game rules and versions
- Current game time

### Rate Limiting

Please note that the TruckersMP API has rate limiting in place. This application implements appropriate caching and request throttling to ensure smooth operation.

## 📊 Available Data

### Player Information
- Basic profile data (name, avatar, join date)
- Steam integration (SteamID64)
- Ban status and history
- VTC membership and history
- Achievements and awards
- Patreon status and permissions
- Staff permissions

### Server Data
- Real-time player counts
- Server configurations
- Game modes and special events
- ProMods support
- Collision and speed limiter settings

### VTC Information
- Company profiles and statistics
- Member listings and roles
- Recruitment status
- Social media integration
- Company history and verification

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow the existing code style
2. Add appropriate type definitions
3. Include comments for complex logic
4. Test your changes thoroughly
5. Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This is an unofficial application and is not affiliated with TruckersMP or SCS Software. All data is provided by the official TruckersMP API.

## 🔗 Links

- [TruckersMP Official Website](https://truckersmp.com)
- [TruckersMP API Documentation](https://truckersmp.com/developers/api)
- [Live Demo](https://truckersmp.vercel.app/)

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/HarmanPreet-Singh-XYT/truckersmp/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about the issue

## 🙏 Acknowledgments

- TruckersMP team for providing the public API