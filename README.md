# Japanese Kanji Quiz App

A React-based web application designed to help users practice Japanese by entering Hiragana readings for displayed Kanji/Katakana words. The app integrates with an external Kanji API and supports CSV-based word list loading from Google Sheets.

## Features

- **Kanji Flashcards**: Displays Kanji/Katakana words and checks user input against the correct Hiragana reading.
- **Timer-Based Learning**: Automatically progresses to the next word after a set interval.
- **Kanji API Integration**: Fetches Onyomi, Kunyomi, and stroke animation data.
- **CSV-Based Word List Loading**: Supports Google Sheets-based lists for easy customization.
- **Progress Tracking**: Stores user progress to allow resuming from the last word.

## Technologies Used

- **React** with TypeScript
- **Material-UI (MUI)** for styling
- **Kanji API** for additional data
- **Google Sheets** for word list storage
- **Local Storage** for progress tracking

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/AnPhuoc2410/QuizzJapanese.git
   cd QuizzJapanese
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your API credentials:
   ```env
   VITE_API_SHEET_URL=your_api_sheet
   VITE_KANJI_API_KEY=your_api_key
   VITE_KANJI_API_HOST=your_api_host
   ```

4. Start the development server:
   ```sh
   npm run dev
   ```

## Usage

1. Start the quiz to see a Kanji/Katakana word.
2. Type the correct Hiragana reading.
3. Submit your answer and move to the next word.
4. If the timer is enabled, the app will automatically advance after a set time.
5. Use API integration to learn Onyomi, Kunyomi, and stroke order animations.

## Future Enhancements

- **Mobile UI Improvements**: Swipe gestures for navigation.
- **Audio Pronunciation**: Fetch and play sound files for words.
- **Scoring System**: Gamify learning with points and streaks.
- **Export/Import Progress**: Allow users to save and load their progress.

## Contributing

Feel free to fork the repository and submit pull requests with improvements or bug fixes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Our Contributors ✨

<a href="https://github.com/AnPhuoc2410/QuizzJapanese/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=AnPhuoc2410/QuizzJapanese" />
</a>
