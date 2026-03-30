SELECT i.token, g.name, g.is_main
FROM invitations i
JOIN guests g ON g.invitation_id = i.id;