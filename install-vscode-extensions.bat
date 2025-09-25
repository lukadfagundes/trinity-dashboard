@echo off
echo Installing VS Code Extensions for Trinity Dashboard Development...
echo.

echo Installing ESLint...
code --install-extension dbaeumer.vscode-eslint

echo Installing Prettier...
code --install-extension esbenp.prettier-vscode

echo Installing Python...
code --install-extension ms-python.python

echo Installing Pylance...
code --install-extension ms-python.vscode-pylance

echo Installing Rust Analyzer...
code --install-extension rust-lang.rust-analyzer

echo Installing Dart and Flutter...
code --install-extension Dart-Code.dart-code
code --install-extension Dart-Code.flutter

echo Installing GitHub Actions...
code --install-extension github.vscode-github-actions

echo Installing YAML Support...
code --install-extension redhat.vscode-yaml

echo Installing GitLens...
code --install-extension eamodio.gitlens

echo Installing Tailwind CSS IntelliSense...
code --install-extension bradlc.vscode-tailwindcss

echo Installing React snippets...
code --install-extension dsznajder.es7-react-js-snippets

echo Installing Markdown Preview Enhanced...
code --install-extension shd101wyy.markdown-preview-enhanced

echo Installing DotENV...
code --install-extension mikestead.dotenv

echo Installing npm Intellisense...
code --install-extension christian-kohler.npm-intellisense

echo Installing Path Intellisense...
code --install-extension christian-kohler.path-intellisense

echo Installing Auto Rename Tag...
code --install-extension formulahendry.auto-rename-tag

echo Installing Color Highlight...
code --install-extension naumovs.color-highlight

echo Installing Error Lens...
code --install-extension usernamehw.errorlens

echo.
echo ================================
echo All extensions installed!
echo Please reload VS Code to activate all extensions.
echo ================================
pause