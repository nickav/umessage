on split(theString, theDelimiter)
	-- save delimiters to restore old settings
	set oldDelimiters to AppleScript's text item delimiters
	
	-- set delimiters to delimiter to be used
	set AppleScript's text item delimiters to theDelimiter
	
	-- create the array
	--set theArray to every text item of theString
	set theArray to text items of theString
	
	-- restore the old setting
	set AppleScript's text item delimiters to oldDelimiters
	
	-- return the result
	return theArray
end split

on getMessageService()
	tell application "Messages" to return 1st service whose service type = iMessage
end getMessageService

on getBuddies(a_phone)
	set m_phoneArr to my split(a_phone, ",")
	set m_buddies to {}
	
	-- get list of all buddies from Messages
	set m_targetService to my getMessageService()
	repeat with m_phone in m_phoneArr
		tell application "Messages" to set m_buddy to buddy m_phone of m_targetService
		copy m_buddy to the end of m_buddies
	end repeat
	
	return m_buddies
end getBuddies

on getChat(a_phone)
	tell application "Messages" to return make new text chat with properties {participants:my getBuddies(a_phone)}
end getChat

on run {targetPhone, targetMessage}
	tell application "Messages"
		set m_chat to my getChat(targetPhone)
		send targetMessage to m_chat
	end tell
end run
