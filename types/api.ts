// TruckersMP API Types

/**
 * Information about player's Patreon status.
 */
export interface PlayerPatreon {
  /**
   * If the user has donated or is currently donating via Patreon.
   */
  isPatron: boolean;

  /**
   * If the user has an active Patreon subscription.
   */
  active: boolean;

  /**
   * Hex code for subscribed tier.
   */
  color: string;

  /**
   * The tier ID of current pledge.
   */
  tierId: number;

  /**
   * Current pledge in cents.
   */
  currentPledge: number;

  /**
   * Lifetime pledge in cents.
   */
  lifetimePledge: number;

  /**
   * Next pledge in cents.
   */
  nextPledge: number;

  /**
   * If user has their Patreon information hidden.
   */
  hidden: boolean;
}

/**
 * Permissions that the player has.
 */
export interface PlayerPermissions {
  /**
   * If the user is a TruckersMP staff member.
   */
  isStaff: boolean;

  /**
   * If the user is part of upper staff within the TruckersMP team.
   */
  isUpperStaff: boolean;

  /**
   * If the user has Game Moderator permissions.
   */
  isGameAdmin: boolean;

  /**
   * If the user should be shown with detailed information on web maps.
   */
  showDetailedOnWebMaps: boolean;
}

/**
 * Information about player's membership in a virtual trucking company.
 */
export interface PlayerVTC {
  /**
   * ID of the company the user belongs to or 0 if not in a company.
   */
  id: number;

  /**
   * Name of the company the user belongs to or empty if not in a company.
   */
  name: string;

  /**
   * Tag of the company the user belongs to or empty if not in a company.
   */
  tag: string;

  /**
   * If the user is in a company.
   */
  inVTC: boolean;

  /**
   * Company member ID or 0 if not in a company.
   */
  memberID: number;
}

/**
 * Entry with brief information of the company the player was previously in.
 */
export interface PlayerVTCHistory {
  /**
   * ID of the company.
   */
  id: number;

  /**
   * Name of the company.
   */
  name: string;

  /**
   * If the company is verified.
   */
  verified: boolean;

  /**
   * Date and time the user joined the company (UTC).
   */
  joinDate: string;

  /**
   * Date and time the user left the company (UTC).
   */
  leftDate: string;
}

/**
 * Entry with information of an achievement obtained by the player.
 */
export interface PlayerAchievement {
  /**
   * The ID of the achievement.
   */
  id: number;

  /**
   * The title of the achievement.
   */
  title: string;

  /**
   * The description of the achievement.
   */
  description: string;

  /**
   * The link to the achievement image.
   */
  image_url: string;

  /**
   * The date and time the user was given the achievement (UTC).
   */
  achieved_at: string;
}

/**
 * Entry with information of an award given to the player.
 */
export interface PlayerAward {
  /**
   * The ID of the award.
   */
  id: number;

  /**
   * The name of the award.
   */
  name: string;

  /**
   * The link to the award image.
   */
  image_url: string;

  /**
   * The date and time the user was given the award (UTC).
   */
  awarded_at: string;
}

/**
 * Information about a TruckersMP player.
 */
export interface Player {
  /**
   * The ID of the requested user.
   */
  id: number;

  /**
   * The name of the user.
   */
  name: string;

  /**
   * URL to the avatar used on the website.
   */
  avatar: string;

  /**
   * URL to the avatar used on the website (32px x 32px).
   */
  smallAvatar: string;

  /**
   * The date and time the user registered (UTC).
   */
  joinDate: string;

  /**
   * The SteamID64 of the user.
   */
  steamID64: number;

  /**
   * The SteamID64 of the user.
   */
  steamID: string;

  /**
   * The Discord account linked to the user or empty if not linked or private.
   */
  discordSnowflake: string;

  /**
   * If the user's company history is visible.
   */
  displayVTCHistory: boolean;

  /**
   * The name of the group the user belongs to.
   */
  groupName: string;

  /**
   * The color of the group.
   */
  groupColor: string;

  /**
   * The ID of the group the user belongs to.
   */
  groupID: number;

  /**
   * If the user is currently banned.
   */
  banned: boolean;

  /**
   * When the user's ban expires (deprecated).
   */
  bannedUntil: string;

  /**
   * The number of active bans a user has or null if private.
   */
  bansCount: number;

  /**
   * If the user has their bans hidden.
   */
  displayBans: boolean;

  /**
   * Data of the player's Patreon status.
   */
  patreon: PlayerPatreon;

  /**
   * Permissions that the player has.
   */
  permissions: PlayerPermissions;

  /**
   * Information about player's membership in a virtual trucking company.
   */
  vtc: PlayerVTC;

  /**
   * Entries with brief information of a company the player was in.
   */
  vtcHistory: Array<PlayerVTCHistory>;

  /**
   * List of achievements obtained by the player.
   */
  achievements: Array<PlayerAchievement>;

  /**
   * List of awards given to the player.
   */
  awards: Array<PlayerAward>;
}

/**
 * Information about a current player's ban.
 */
export interface Ban {
  /**
   * The time the ban will expire.
   */
  expiration: string;

  /**
   * The time the ban was issued.
   */
  timeAdded: string;

  /**
   * If the ban is still active or was disabled.
   */
  active: boolean;

  /**
   * The reason for the ban.
   */
  reason: string;

  /**
   * Name of the admin that banned the user (deprecated).
   */
  adminName: string;

  /**
   * TruckersMP ID for the admin that banned the user (deprecated).
   */
  adminID: number;
}

/**
 * A short name of a supported game.
 */
export type ServerGameName = 'ETS2' | 'ATS';

/**
 * Information of a TruckersMP server and its status.
 */
export interface Server {
  /**
   * The ID given to the server.
   */
  id: number;

  /**
   * What game the server is for.
   */
  game: string;

  /**
   * The server IP address.
   */
  ip: string;

  /**
   * The port that the server runs on.
   */
  port: number;

  /**
   * Name of the server.
   */
  name: string;

  /**
   * Shortname for the server.
   */
  shortname: string;

  /**
   * Shown in-game in front of a player's ID.
   */
  idprefix: string;

  /**
   * If the server is online or not.
   */
  online: boolean;

  /**
   * How many players are currently on the server.
   */
  players: number;

  /**
   * Amount of players waiting in the queue to join the server.
   */
  queue: number;

  /**
   * The max amount of players allowed on the server at once.
   */
  maxplayers: number;

  /**
   * The map ID given to the server used by ETS2Map.
   */
  mapid: number;

  /**
   * Determines the order in which servers are displayed.
   */
  displayorder: number;

  /**
   * Whether or not the speed limiter is enabled on the server.
   */
  speedlimiter: number;

  /**
   * If server wide collisions is enabled.
   */
  collisions: boolean;

  /**
   * If cars are enabled for players.
   */
  carsforplayers: boolean;

  /**
   * If police cars can be driven by players.
   */
  policecarsforplayers: boolean;

  /**
   * If AFK kick is enabled for players.
   */
  afkenabled: boolean;

  /**
   * If the server is an event server.
   */
  event: boolean;

  /**
   * Determine whether the server hosts special event files.
   */
  specialEvent: boolean;

  /**
   * Determine whether the server hosts ProMods.
   */
  promods: boolean;

  /**
   * Server tick rate (in ms).
   */
  syncdelay: number;
}

/**
 * A short name of an "event" game.
 */
export type EventGameName = 'ETS2' | 'ATS' | 'ETS2 - ProMods';

/**
 * Type of the game event.
 */
export interface EventType {
  /**
   * The event's type key.
   */
  key: string;

  /**
   * The event's type name.
   */
  name: string;
}

/**
 * Information of the event's game server.
 */
export interface EventServer {
  /**
   * The event's server ID.
   */
  id: number;

  /**
   * The event's server name.
   */
  name: string;
}

/**
 * Information of the event's game location.
 */
export interface EventLocation {
  /**
   * The specific location name.
   */
  location: string;

  /**
   * The city of the arrival/departure.
   */
  city: string;
}

/**
 * Information about the event's organizing company.
 */
export interface EventVTC {
  /**
   * The company's ID.
   */
  id: number;

  /**
   * The company's name.
   */
  name: string;
}

/**
 * Information about the event's creator.
 */
export interface EventUser {
  /**
   * The user's TruckersMP ID.
   */
  id: number;

  /**
   * The user's username.
   */
  username: string;
}

/**
 * Information about event attendees.
 */
export interface EventAttendanceUser {
  /**
   * The user's TruckersMP ID.
   */
  id: number;

  /**
   * The user's username.
   */
  username: string;

  /**
   * Whether the user is following the event.
   */
  following: boolean;

  /**
   * The date and time the user marked their attendance at (UTC).
   */
  created_at: string;

  /**
   * The date and time the user updated their attendance at (UTC).
   */
  updated_at: string;
}

/**
 * Information about company attendees.
 */
export interface EventAttendanceVTC {
  /**
   * The company's ID.
   */
  id: number;

  /**
   * The company's name.
   */
  name: string;

  /**
   * Whether the company is following the event.
   */
  following: boolean;

  /**
   * The date and time the company marked their attendance at (UTC).
   */
  created_at: string;

  /**
   * The date and time the company updated their attendance at (UTC).
   */
  updated_at: string;
}

/**
 * Data of the event attendance.
 */
export interface EventAttendances {
  /**
   * The number of confirmed attendees.
   */
  confirmed: string;

  /**
   * The number of unsure attendees.
   */
  unsure: string;

  /**
   * The number of confirmed virtual trucking companies.
   */
  vtcs: number;

  /**
   * Confirmed user attendees.
   */
  confirmed_users?: Array<EventAttendanceUser>;

  /**
   * Confirmed company attendees.
   */
  confirmed_vtcs?: Array<EventAttendanceVTC>;

  /**
   * Unsure user attendees.
   */
  unsure_users?: Array<EventAttendanceUser>;
}

/**
 * Information about the event's required DLCs.
 */
export interface EventDLC {
  /**
   * The DLC's Steam app ID.
   */
  dlc_id: string;
}

/**
 * Information of the specific game event.
 */
export interface Event {
  /**
   * The event's ID.
   */
  id: number;

  /**
   * The event's type.
   */
  event_type: EventType;

  /**
   * The event's name.
   */
  name: string;

  /**
   * The event's slug.
   */
  slug: string;

  /**
   * The event's game.
   */
  game: string;

  /**
   * The event's server information.
   */
  server: EventServer;

  /**
   * The event's main language.
   */
  language: string;

  /**
   * The departure location of the convoy.
   */
  departure: EventLocation;

  /**
   * The arrival location of the convoy.
   */
  arrive: EventLocation;

  /**
   * The date and time the event's meetup is scheduled at (UTC).
   */
  meetup_at: string;

  /**
   * The date and time the event starts at (UTC).
   */
  start_at: string;

  /**
   * The URL to the banner used on the website.
   */
  banner: string;

  /**
   * The URL to the map used on the website.
   */
  map: string;

  /**
   * The event's description in Markdown.
   */
  description: string;

  /**
   * The event's rules in Markdown.
   */
  rule: string;

  /**
   * The URL to the event's voice location.
   */
  voice_link: string;

  /**
   * The external URL specified for the event.
   */
  external_link: string;

  /**
   * The featured status of the event.
   */
  featured: string;

  /**
   * Data of the company that hosts the event.
   */
  vtc: EventVTC;

  /**
   * The user that created the event.
   */
  user: EventUser;

  /**
   * Data of the event attendance.
   */
  attendances: EventAttendances;

  /**
   * The event's required DLCs.
   */
  dlcs: EventDLC;

  /**
   * The relative URL to the event page.
   */
  url: string;

  /**
   * The date and time the event was created at (UTC).
   */
  created_at: string;

  /**
   * The date and time the event was updated at (UTC).
   */
  updated_at: string;
}

/**
 * A collection of social media of a virtual trucking company.
 */
export interface VTCSocials {
  /**
   * The URL to the company's Twitter.
   */
  twitter: string | null;

  /**
   * The URL to the company's Facebook.
   */
  facebook: string | null;

  /**
   * The URL to the company's Twitch.
   */
  twitch: string | null;

  /**
   * The URL to the company's Discord.
   */
  discord: string | null;

  /**
   * The URL to the company's YouTube.
   */
  youtube: string | null;
}

/**
 * A collection of games that the virtual trucking company supports.
 */
export interface VTCGames {
  /**
   * Whether the company supports American Truck Simulator.
   */
  ats: boolean;

  /**
   * Whether the company supports Euro Truck Simulator 2.
   */
  ets: boolean;
}

/**
 * Data entry of a virtual trucking company.
 */
export interface VTC {
  /**
   * The ID of the company.
   */
  id: number;

  /**
   * The name of the company.
   */
  name: string;

  /**
   * The user TruckersMP ID of the company's owner.
   */
  owner_id: number;

  /**
   * The username of the company's owner.
   */
  owner_username: string;

  /**
   * The company's slogan.
   */
  slogan: string;

  /**
   * The company's tag.
   */
  tag: string;

  /**
   * The URL to the logo used on the website.
   */
  logo?: string;

  /**
   * The URL to the cover photo used on the website.
   */
  cover?: string;

  /**
   * The company's information in Markdown.
   */
  information?: string;

  /**
   * The company's rules in Markdown.
   */
  rules?: string;

  /**
   * The company's requirements in Markdown.
   */
  requirements?: string;

  /**
   * The URL to the company's website.
   */
  website: string | null;

  /**
   * A collection of social media profiles of the company.
   */
  social: VTCSocials;

  /**
   * A collection of games that the company supports.
   */
  games: VTCGames;

  /**
   * The company's member count.
   */
  members_count: number;

  /**
   * The status of the company's recruitment.
   */
  recruitment: string;

  /**
   * The company's main language.
   */
  language: string;

  /**
   * Whether the company is verified.
   */
  verified: boolean;

  /**
   * Whether the company is validated.
   */
  validated: boolean;

  /**
   * The date and time the company was created at (UTC).
   */
  created: string;
}

/**
 * Information of the company's role.
 */
export interface VTCRole {
  /**
   * The ID of the role.
   */
  id: number;

  /**
   * The name of the role.
   */
  name: string;

  /**
   * The current position of the role.
   */
  order: number;

  /**
   * If the role has owner permissions.
   */
  owner: boolean;

  /**
   * The date and time the role was created (UTC).
   */
  created_at: string;

  /**
   * The date and time the role was updated at (UTC).
   */
  updated_at: string;
}

/**
 * Information of the specific member of a virtual trucking company.
 */
export interface VTCMember {
  /**
   * The ID of the company member.
   */
  id: number;

  /**
   * The member's TruckersMP ID.
   */
  user_id: number;

  /**
   * The username of the company member.
   */
  username: string;

  /**
   * The member's Steam ID.
   */
  steam_id: number;

  /**
   * The member's Steam ID64.
   */
  steamID64: number;

  /**
   * The member's Steam ID.
   */
  steamID: string;

  /**
   * A list of roles the member has.
   */
  roles: Array<VTCRole>;

  /**
   * The member's role ID.
   */
  role_id: number;

  /**
   * The member's role name.
   */
  role: string;

  /**
   * Whether the member has owner permissions.
   */
  is_owner: boolean;

  /**
   * The date and time the member joined at (UTC).
   */
  joinDate: string;
}

/**
 * Information of the virtual trucking company's news.
 */
export interface VTCNews {
  /**
   * The ID of the article.
   */
  id: number;

  /**
   * The title of the article.
   */
  title: string;

  /**
   * A summary of the article.
   */
  content_summary: string;

  /**
   * The full content of the article.
   */
  content?: string;

  /**
   * The user's TruckersMP ID who made the article.
   */
  author_id: number;

  /**
   * The username of the user who made the article.
   */
  author: string;

  /**
   * Whether the article is pinned.
   */
  pinned: boolean;

  /**
   * The date and time the article was updated at (UTC).
   */
  updated_at: string;

  /**
   * The date and time the article was published at (UTC).
   */
  published_at: string;
}

/**
 * The current in-game time.
 */
export interface GameTime {
  /**
   * Game time returned in minutes (10 real seconds are 1 minute in-game).
   */
  game_time: number;
}

/**
 * Information of a TruckersMP file in the version response.
 */
export interface VersionChecksum {
  /**
   * Checksum of core.dll.
   */
  dll: string;

  /**
   * Checksum of data1.adb.
   */
  adb: string;
}

/**
 * Information about the current TruckersMP version.
 */
export interface Version {
  /**
   * Name of the current version.
   */
  name: string;

  /**
   * Numeric name of the current version.
   */
  numeric: string;

  /**
   * Current stage in the development process.
   */
  stage: string;

  /**
   * Information of ETS2MP files.
   */
  ets2mp_checksum: VersionChecksum;

  /**
   * Information of ATSMP files.
   */
  atsmp_checksum: VersionChecksum;

  /**
   * The time that the version was released.
   */
  time: string;

  /**
   * ETS2 version that is supported.
   */
  supported_game_version: string;

  /**
   * ATS version that is supported.
   */
  supported_ats_game_version: string;
}

/**
 * Current in-game rules.
 */
export interface Rules {
  /**
   * Markdown of the current in-game rules.
   */
  rules: string;

  /**
   * Version number.
   */
  revision: number;
}