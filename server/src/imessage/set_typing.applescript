on run {}
	set phoneNumber to ""
	set targetMessage to "(typing)"
	
	tell application "System Events" to tell process "Messages"
		tell application "Messages" to activate
		keystroke "n" using command down
		
		-- get phone number input
		set theTextField to missing value
		
		try
			set theTextField to text field 1 of scroll area 3 of splitter group 1 of window 1
		on error
			set theTextField to text field 1 of scroll area 4 of splitter group 1 of window 1
		end try
		
		tell window 1
			tell theTextField
				set value to phoneNumber
				keystroke ","
			end tell
			
			-- get message text
			set theTextArea to missing value
			
			try
				set theTextArea to text area 1 of scroll area 4 of splitter group 1
			on error
				set theTextArea to text area 1 of scroll area 3 of splitter group 1
			end try
			
			tell theTextArea
				select
				set value to targetMessage
			end tell
		end tell
	end tell
end run
