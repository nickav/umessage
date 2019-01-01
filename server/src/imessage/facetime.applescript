-- facetime-audio:// or tel://
on run {phoneNum}
    do shell script "open facetime-audio://" & quoted form of phoneNum
    tell application "System Events"
        repeat while not (button "Call" of window 1 of application process "FaceTime" exists)
            delay 1
        end repeat
        click button "Call" of window 1 of application process "FaceTime"
    end tell
end run
