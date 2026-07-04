import { PrismaClient, UserRole, ProjectStatus, Platform, BugSeverity, BugPriority, BugStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.gameSession.deleteMany();
  await prisma.environmentInfo.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.bugReport.deleteMany();
  await prisma.builds.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // ============================================================================
  // Users (1 per role)
  // ============================================================================
  const hashedPassword = await hash("password123", 12);

  const admin = await prisma.user.create({
    data: {
      name: "Sarah Chen",
      email: "admin@gameqa.com",
      password: hashedPassword,
      role: UserRole.ADMIN,
      avatar: null,
    },
  });

  const qaTester = await prisma.user.create({
    data: {
      name: "Minh Tran",
      email: "qa@gameqa.com",
      password: hashedPassword,
      role: UserRole.QA_TESTER,
      avatar: null,
    },
  });

  const developer = await prisma.user.create({
    data: {
      name: "Alex Rodriguez",
      email: "dev@gameqa.com",
      password: hashedPassword,
      role: UserRole.DEVELOPER,
      avatar: null,
    },
  });

  const producer = await prisma.user.create({
    data: {
      name: "Yuki Tanaka",
      email: "producer@gameqa.com",
      password: hashedPassword,
      role: UserRole.PRODUCER,
      avatar: null,
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "Jordan Park",
      email: "viewer@gameqa.com",
      password: hashedPassword,
      role: UserRole.VIEWER,
      avatar: null,
    },
  });

  console.log("✅ Users created");

  // ============================================================================
  // Projects
  // ============================================================================
  const projectAlpha = await prisma.project.create({
    data: {
      name: "Dragon's Fury Online",
      description:
        "Open-world MMORPG with real-time PvP combat, guild systems, and dynamic world events. Set in a high-fantasy universe with dragons, magic, and ancient civilizations.",
      status: ProjectStatus.ACTIVE,
    },
  });

  const projectBeta = await prisma.project.create({
    data: {
      name: "Neon Strike",
      description:
        "Fast-paced cyberpunk FPS with competitive multiplayer modes, character abilities, and destructible environments. Features ranked matchmaking and seasonal content.",
      status: ProjectStatus.ACTIVE,
    },
  });

  const projectGamma = await prisma.project.create({
    data: {
      name: "Pixel Kingdoms",
      description:
        "Retro-style mobile strategy game with base building, resource management, and PvE campaigns. Supports cross-platform play between Android and iOS.",
      status: ProjectStatus.MAINTENANCE,
    },
  });

  console.log("✅ Projects created");

  // ============================================================================
  // Builds
  // ============================================================================
  const buildAlpha1 = await prisma.builds.create({
    data: {
      projectId: projectAlpha.id,
      version: "0.9.1-beta",
      platform: Platform.WINDOWS,
      releaseDate: new Date("2026-06-15"),
    },
  });

  const buildAlpha2 = await prisma.builds.create({
    data: {
      projectId: projectAlpha.id,
      version: "0.9.1-beta",
      platform: Platform.STEAM,
      releaseDate: new Date("2026-06-15"),
    },
  });

  const buildBeta1 = await prisma.builds.create({
    data: {
      projectId: projectBeta.id,
      version: "1.2.0",
      platform: Platform.PLAYSTATION,
      releaseDate: new Date("2026-06-28"),
    },
  });

  const buildBeta2 = await prisma.builds.create({
    data: {
      projectId: projectBeta.id,
      version: "1.2.0",
      platform: Platform.XBOX,
      releaseDate: new Date("2026-06-28"),
    },
  });

  const buildGamma1 = await prisma.builds.create({
    data: {
      projectId: projectGamma.id,
      version: "2.5.3",
      platform: Platform.ANDROID,
      releaseDate: new Date("2026-06-01"),
    },
  });

  console.log("✅ Builds created");

  // ============================================================================
  // Bug Reports (10 sample bugs)
  // ============================================================================
  const bugs = [
    {
      bugCode: "BUG-000001",
      title: "Game crashes when entering Dragon Cavern zone",
      description:
        "The game freezes and then crashes to desktop whenever the player enters the Dragon Cavern zone in the Northern Highlands area. This happens consistently on every attempt.",
      stepsToReproduce:
        "1. Start the game and log in\n2. Travel to Northern Highlands\n3. Enter the Dragon Cavern zone portal\n4. Game freezes for 2-3 seconds then crashes",
      expectedResult: "Player should load into Dragon Cavern zone without issues",
      actualResult: "Game crashes to desktop with no error message",
      severity: BugSeverity.CRITICAL,
      priority: BugPriority.HIGHEST,
      status: BugStatus.IN_PROGRESS,
      projectId: projectAlpha.id,
      buildId: buildAlpha1.id,
      reporterId: qaTester.id,
      assignedToId: developer.id,
    },
    {
      bugCode: "BUG-000002",
      title: "Player inventory duplicates items on server lag",
      description:
        "When there is high server latency (200ms+), rapidly clicking items in inventory can cause them to duplicate. This is a major exploit that affects game economy.",
      stepsToReproduce:
        "1. Connect to a server with high latency\n2. Open inventory\n3. Rapidly click on a stackable item\n4. Move it between bag slots quickly",
      expectedResult: "Item should move without duplication",
      actualResult: "Item count increases, creating duplicate items",
      severity: BugSeverity.CRITICAL,
      priority: BugPriority.HIGHEST,
      status: BugStatus.ASSIGNED,
      projectId: projectAlpha.id,
      buildId: buildAlpha1.id,
      reporterId: qaTester.id,
      assignedToId: developer.id,
    },
    {
      bugCode: "BUG-000003",
      title: "UI text overlaps on 4K resolution displays",
      description:
        "Various UI elements have text that overlaps or gets cut off when playing at 3840x2160 resolution. Affects main menu, inventory, and quest log.",
      stepsToReproduce:
        "1. Set display resolution to 3840x2160\n2. Launch the game\n3. Open main menu\n4. Navigate to inventory and quest log",
      expectedResult: "All UI text should be properly displayed at 4K resolution",
      actualResult: "Text overlaps and some buttons are not clickable",
      severity: BugSeverity.MAJOR,
      priority: BugPriority.HIGH,
      status: BugStatus.NEW,
      projectId: projectAlpha.id,
      buildId: buildAlpha2.id,
      reporterId: qaTester.id,
      assignedToId: null,
    },
    {
      bugCode: "BUG-000004",
      title: "Matchmaking fails after ranked game disconnection",
      description:
        "After being disconnected from a ranked match, the player cannot rejoin matchmaking queue. The 'Find Match' button becomes unresponsive until the game is restarted.",
      stepsToReproduce:
        "1. Queue for ranked match\n2. Enter a match\n3. Force disconnect (pull ethernet cable)\n4. Reconnect to the game\n5. Try to queue for another match",
      expectedResult: "Player should be able to rejoin matchmaking after reconnecting",
      actualResult: "Find Match button is greyed out and unresponsive",
      severity: BugSeverity.MAJOR,
      priority: BugPriority.HIGH,
      status: BugStatus.FIXED,
      projectId: projectBeta.id,
      buildId: buildBeta1.id,
      reporterId: qaTester.id,
      assignedToId: developer.id,
    },
    {
      bugCode: "BUG-000005",
      title: "Audio cuts out during ability activation sequence",
      description:
        "The game audio occasionally cuts out for 1-2 seconds when activating the 'Cyber Dash' ability. More frequent when multiple players use abilities simultaneously.",
      stepsToReproduce:
        "1. Select Agent with Cyber Dash ability\n2. Enter a match with other players\n3. Activate Cyber Dash during a firefight\n4. Notice audio dropping out",
      expectedResult: "Audio should play smoothly during ability activation",
      actualResult: "Audio drops out for 1-2 seconds intermittently",
      severity: BugSeverity.MEDIUM,
      priority: BugPriority.MEDIUM,
      status: BugStatus.READY_FOR_TEST,
      projectId: projectBeta.id,
      buildId: buildBeta2.id,
      reporterId: qaTester.id,
      assignedToId: developer.id,
    },
    {
      bugCode: "BUG-000006",
      title: "Kill feed shows wrong weapon icon",
      description:
        "The kill feed sometimes displays the wrong weapon icon. For example, getting a kill with the Plasma Rifle shows the Shotgun icon instead.",
      stepsToReproduce:
        "1. Equip Plasma Rifle\n2. Get a kill in multiplayer\n3. Check the kill feed notification",
      expectedResult: "Kill feed should show Plasma Rifle icon",
      actualResult: "Kill feed shows Shotgun icon instead",
      severity: BugSeverity.MINOR,
      priority: BugPriority.LOW,
      status: BugStatus.VERIFIED,
      projectId: projectBeta.id,
      buildId: buildBeta1.id,
      reporterId: qaTester.id,
      assignedToId: developer.id,
    },
    {
      bugCode: "BUG-000007",
      title: "Building placement offset on tablet devices",
      description:
        "On tablets (iPad, Android tablets), building placement is offset by approximately 1 tile from where the player taps. This makes precise building placement impossible.",
      stepsToReproduce:
        "1. Open the game on a tablet\n2. Enter build mode\n3. Try to place a building\n4. Notice the offset between tap position and actual placement",
      expectedResult: "Building should be placed exactly where the player taps",
      actualResult: "Building is placed 1 tile to the right of the tap position",
      severity: BugSeverity.MAJOR,
      priority: BugPriority.HIGH,
      status: BugStatus.OPEN,
      projectId: projectGamma.id,
      buildId: buildGamma1.id,
      reporterId: qaTester.id,
      assignedToId: developer.id,
    },
    {
      bugCode: "BUG-000008",
      title: "Resource counter shows negative values",
      description:
        "After a specific sequence of rapid resource spending, the gold counter can display negative values. The actual balance is correct server-side but UI shows wrong value.",
      stepsToReproduce:
        "1. Accumulate exactly 100 gold\n2. Quickly purchase two items worth 50 gold each\n3. Check gold counter",
      expectedResult: "Gold counter should show 0",
      actualResult: "Gold counter briefly shows -50 before correcting",
      severity: BugSeverity.MINOR,
      priority: BugPriority.MEDIUM,
      status: BugStatus.CLOSED,
      projectId: projectGamma.id,
      buildId: buildGamma1.id,
      reporterId: qaTester.id,
      assignedToId: developer.id,
    },
    {
      bugCode: "BUG-000009",
      title: "Guild chat messages not persisting after relog",
      description:
        "Guild chat history is lost when a player logs out and back in. Messages sent by other guild members during the session are not loaded upon reconnection.",
      stepsToReproduce:
        "1. Join a guild\n2. Send and receive messages in guild chat\n3. Log out of the game\n4. Log back in\n5. Open guild chat",
      expectedResult: "Previous guild chat messages should be loaded from history",
      actualResult: "Guild chat appears empty after relog",
      severity: BugSeverity.MEDIUM,
      priority: BugPriority.MEDIUM,
      status: BugStatus.NEW,
      projectId: projectAlpha.id,
      buildId: buildAlpha1.id,
      reporterId: qaTester.id,
      assignedToId: null,
    },
    {
      bugCode: "BUG-000010",
      title: "Tooltip text has typo in German localization",
      description: 'The tooltip for the "Heal" spell shows "Heilen" with incorrect capitalization in the German localization. It reads "heilen" instead of "Heilen".',
      stepsToReproduce:
        "1. Set game language to German\n2. Open spell book\n3. Hover over the Heal spell\n4. Check tooltip text",
      expectedResult: 'Tooltip should read "Heilen" (capitalized)',
      actualResult: 'Tooltip reads "heilen" (lowercase)',
      severity: BugSeverity.TRIVIAL,
      priority: BugPriority.LOW,
      status: BugStatus.DUPLICATE,
      projectId: projectAlpha.id,
      buildId: buildAlpha2.id,
      reporterId: viewer.id,
      assignedToId: null,
    },
  ];

  for (const bugData of bugs) {
    const bug = await prisma.bugReport.create({ data: bugData });

    // Add environment info for some bugs
    if (["BUG-000001", "BUG-000003", "BUG-000004"].includes(bugData.bugCode)) {
      await prisma.environmentInfo.create({
        data: {
          bugId: bug.id,
          os: "Windows 11 Pro 24H2",
          cpu: "AMD Ryzen 9 7950X",
          gpu: "NVIDIA RTX 4090",
          ram: "32GB DDR5",
          resolution: bugData.bugCode === "BUG-000003" ? "3840x2160" : "2560x1440",
          driverVersion: "560.81",
          gameLanguage: "English",
          fps: bugData.bugCode === "BUG-000001" ? 0 : 120,
        },
      });
    }

    // Add game session for some bugs
    if (["BUG-000001", "BUG-000002", "BUG-000009"].includes(bugData.bugCode)) {
      await prisma.gameSession.create({
        data: {
          bugId: bug.id,
          map: bugData.bugCode === "BUG-000001" ? "Northern Highlands" : "Central Hub",
          mission: bugData.bugCode === "BUG-000001" ? "Dragon's Lair" : null,
          character: "Warrior",
          weapon: "Dragon Slayer Sword",
          server: "Asia-Pacific-01",
          roomId: `ROOM-${Math.floor(Math.random() * 9999)
            .toString()
            .padStart(4, "0")}`,
        },
      });
    }
  }

  console.log("✅ Bug reports created");

  // ============================================================================
  // Sample Comments
  // ============================================================================
  const bug1 = await prisma.bugReport.findUnique({ where: { bugCode: "BUG-000001" } });
  if (bug1) {
    await prisma.comment.create({
      data: {
        bugId: bug1.id,
        userId: qaTester.id,
        message: "This crash is 100% reproducible on my machine. Happens every time I enter the Dragon Cavern zone. Crash dump attached.",
      },
    });
    await prisma.comment.create({
      data: {
        bugId: bug1.id,
        userId: developer.id,
        message:
          "Looking into this now. Seems related to the terrain streaming system. The zone has a very large mesh that might be causing an out-of-memory issue on load.",
      },
    });
    await prisma.comment.create({
      data: {
        bugId: bug1.id,
        userId: producer.id,
        message: "This is blocking our beta launch. @Alex please prioritize this fix.",
      },
    });
  }

  console.log("✅ Comments created");

  // ============================================================================
  // Sample Activity Logs
  // ============================================================================
  if (bug1) {
    await prisma.activityLog.createMany({
      data: [
        {
          bugId: bug1.id,
          userId: qaTester.id,
          action: "Created Bug",
          oldValue: null,
          newValue: "BUG-000001",
        },
        {
          bugId: bug1.id,
          userId: admin.id,
          action: "Status Changed",
          oldValue: "NEW",
          newValue: "ASSIGNED",
        },
        {
          bugId: bug1.id,
          userId: admin.id,
          action: "Assigned Developer",
          oldValue: null,
          newValue: "Alex Rodriguez",
        },
        {
          bugId: bug1.id,
          userId: developer.id,
          action: "Status Changed",
          oldValue: "ASSIGNED",
          newValue: "IN_PROGRESS",
        },
      ],
    });
  }

  console.log("✅ Activity logs created");

  // ============================================================================
  // Sample Notifications
  // ============================================================================
  await prisma.notification.createMany({
    data: [
      {
        userId: developer.id,
        title: "New Bug Assigned",
        message: "You have been assigned to BUG-000001: Game crashes when entering Dragon Cavern zone",
        isRead: true,
      },
      {
        userId: developer.id,
        title: "New Bug Assigned",
        message: "You have been assigned to BUG-000002: Player inventory duplicates items on server lag",
        isRead: false,
      },
      {
        userId: qaTester.id,
        title: "Bug Status Updated",
        message: "BUG-000004 has been marked as Fixed. Please verify.",
        isRead: false,
      },
      {
        userId: producer.id,
        title: "Critical Bug Reported",
        message: "A new Critical bug has been reported: BUG-000001",
        isRead: true,
      },
      {
        userId: qaTester.id,
        title: "Mentioned in Comment",
        message: "Yuki Tanaka mentioned you in a comment on BUG-000001",
        isRead: false,
      },
    ],
  });

  console.log("✅ Notifications created");
  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
