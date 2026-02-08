# AI Usage Log - Cosmic Watch Backend

## AI Role
The AI (Antigravity) acted as a Senior Backend Engineer and System Architect to design and implement the Cosmic Watch REST API.

## Implementation Details
- **Architecture**: Followed a clean MVC-style architecture with clear separation of concerns (Controllers, Models, Routes, Services).
- **Security**: Implemented JWT-based authentication and password hashing with bcryptjs.
- **Data Integration**: Integrated NASA NeoWs API with custom normalization and MongoDB caching logic to minimize redundant API calls.
- **Risk Analysis**: Developed a custom scoring engine based on astronomical data parameters.
- **Real-Time**: Set up Socket.io for live alerts and chat rooms.
- **Automation**: Configured node-cron for daily background tasks.
- **DevOps**: Provided multi-stage Dockerfile and Docker Compose configuration for seamless deployment.

## Key Decisions
- Used `findOneAndUpdate` with `upsert: true` for NASA data to ensure the database always has the latest info without duplicates.
- Implemented room-based socket logic for efficient broadcasting of chat messages and user-specific alerts.
- Used a weights-based risk scoring system for intuitive risk assessment.
