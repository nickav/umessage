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

on run {targetPhone, targetMessage}
	tell application "Messages"
		set targetService to 1st service whose service type = iMessage
		set targetBuddyPhones to my split(targetPhone, ",")

		set targetBuddies to {}
		repeat with thePhone in targetBuddyPhones
			set targetBuddy to buddy thePhone of targetService
			copy targetBuddy to the end of targetBuddies
		end repeat

		set thisChat to make new text chat with properties {participants:targetBuddies}
		send targetMessage to thisChat
	end tell
end run
