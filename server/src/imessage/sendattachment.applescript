on run {targetBuddyPhone, targetFile}
    set filePath to POSIX file targetFile

    tell application "Messages"
        set targetService to 1st service whose service type = iMessage
        set targetBuddy to buddy targetBuddyPhone of targetService
        send filePath to targetBuddy
    end tell
end run

