
INSERT INTO public.standings (team_id, gp, w, l, ot, pts, gf, ga) VALUES
  ('a1000000-0000-0000-0000-000000000004', 12, 9, 2, 1, 19, 42, 25),
  ('a1000000-0000-0000-0000-000000000001', 12, 8, 3, 1, 17, 38, 28),
  ('a1000000-0000-0000-0000-000000000003', 12, 8, 3, 1, 17, 35, 24),
  ('a1000000-0000-0000-0000-000000000005', 12, 7, 4, 1, 15, 34, 27),
  ('a1000000-0000-0000-0000-000000000002', 12, 7, 4, 1, 15, 33, 26),
  ('a1000000-0000-0000-0000-000000000006', 12, 5, 5, 2, 12, 30, 32),
  ('a1000000-0000-0000-0000-000000000008', 12, 3, 7, 2, 8, 22, 35),
  ('a1000000-0000-0000-0000-000000000007', 12, 2, 9, 1, 5, 18, 40)
ON CONFLICT (team_id) DO UPDATE SET gp=EXCLUDED.gp, w=EXCLUDED.w, l=EXCLUDED.l, ot=EXCLUDED.ot, pts=EXCLUDED.pts, gf=EXCLUDED.gf, ga=EXCLUDED.ga;

INSERT INTO public.matches (team_a_id, team_b_id, team_a_score, team_b_score, match_date, match_time, status, season) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000006', 4, 2, '2026-03-15', '19:00', 'Completed', 'Season 1'),
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 3, 1, '2026-03-16', '20:00', 'Completed', 'Season 1'),
  ('a1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000007', 5, 0, '2026-03-17', '18:00', 'Completed', 'Season 1'),
  ('a1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000008', 3, 2, '2026-03-18', '20:00', 'Completed', 'Season 1'),
  ('a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 2, 3, '2026-03-22', '19:00', 'Completed', 'Season 1'),
  ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 2, 2, '2026-03-23', '20:00', 'Completed', 'Season 1'),
  ('a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', NULL, NULL, '2026-04-02', '20:00', 'Scheduled', 'Season 1'),
  ('a1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', NULL, NULL, '2026-04-03', '19:00', 'Scheduled', 'Season 1'),
  ('a1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000007', NULL, NULL, '2026-04-04', '18:00', 'Scheduled', 'Season 1'),
  ('a1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000008', NULL, NULL, '2026-04-05', '20:00', 'Scheduled', 'Season 1');

INSERT INTO public.news_articles (title, content, author, pinned, published_at) VALUES
  ('Season 1 Officially Underway!', 'The International Puck Hockey Federation is proud to announce the official start of Season 1. Eight national teams will compete in a round-robin group stage followed by a single-elimination playoff bracket. The stakes are high, the competition fierce, and only one team will be crowned champion.', 'IPHF Media', true, '2026-03-01 12:00:00+00'),
  ('Connor McDavid Leads Canada to Dominant Start', 'Canadas captain Connor McDavid has been spectacular in the opening weeks, racking up 28 points in just 12 games. His combination of speed, vision, and finishing ability has made him the clear front-runner for league MVP honors.', 'IPHF Media', false, '2026-03-20 14:00:00+00'),
  ('Finlands Juuse Saros Posts Third Shutout', 'Finnish netminder Juuse Saros continued his stellar form with a 35-save shutout against Slovakia, his third of the tournament. With a .923 save percentage and 2.25 GAA, Saros has established himself as one of the premier goalies.', 'IPHF Media', false, '2026-03-25 10:00:00+00'),
  ('Playoff Race Heating Up', 'With the group stage nearing its conclusion, the battle for playoff positioning is intensifying. Canada, Czech Republic, and Finland have secured comfortable positions, but the fight for remaining spots promises dramatic finishes.', 'IPHF Media', false, '2026-03-28 16:00:00+00');
