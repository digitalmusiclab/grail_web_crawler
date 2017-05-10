# grail_web_crawler


## Workflow
- Seed Scripts > Seed Loader > Job Dispatch > Job Processor > API > Criteria Matching > Insert/Update


## Crawler Processes
- Crawler Master:  Dashboard into Job Queue
- Crawler Worker:  Process Jobs in Queue
- Crawler Seeder:  Adds Jobs in Queue
- Crawler Manager: Controls Job Queue


## Job Processors

### Entity
- Artist
-- Spotify (through Spotify Artist ID OR MixRadio Artist Name) (DEPENDENCY -> Spotify Artist ID from Spotify Track crawl)
-- MusicBrainz (through MusicBrainz Artist ID OR MixRadio Artist Name)
-- Last.fm (through MusicBrainz Artist ID OR MixRadio Artist Name)

- Release
-- Spotify (through Spotify Release ID OR MixRadio Release Name) (DEPENDENCY -> Spotify Release ID from Spotify Track crawl)
-- MusicBrainz (through MixRadio Artist Name, and Release Name)
-- Last.fm (through MusicBrainz Release ID OR MixRadio Artist Name, Release Name)

- Track
-- Spotify (through ISRC)
-- MusicBrainz (through MusicBrainz Track ID OR MusicBrainz Release ID OR MixRadio Track/Release/Artist Name)
-- Last.fm (through MusicBrainz Track ID OR MusicBrainz Release ID OR MixRadio Track/Artist Name)


### Spotify
- albumById
- albumsByIds
- tracksByIsrc

### MusicBrainz 
- releaseById
- releaseByArtistAndName

## API Keys
- Spotify = Not Required
- MusicBrainz = 
- Last.fm = 

## API Wrappers

### Spotify
- Get Album By ID
- Get Albums By IDs
- Get Tracks By ISRC

### MusicBrainz
- Get Release By ID
- Get Release By Artist and Name


## Todo
- Scheduler Automation
- Tests (wrappers, processors, critera-matching)
- Deploy Scripts