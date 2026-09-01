-- Where I'm Watching v1.1 pre-deploy repair
--
-- Earlier pre-release builds used user_service_settings for actions that were
-- not an intentional My Services customization (initial watchlist seeding and
-- adding a custom service). That can make an account look "configured" with
-- only one selected service, hiding the verified catalog in Add Show.
--
-- V1.1 has not been released yet, so reset only this preference marker. This
-- does NOT delete shows, streaming services, custom submissions, or service
-- selection rows. The next checkbox change in My Services recreates the marker.

delete from public.user_service_settings;
