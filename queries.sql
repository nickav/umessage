SELECT * FROM message JOIN chat_message_join ON message.ROWID = chat_message_join.message_id GROUP BY chat_id ORDER BY date DESC;


