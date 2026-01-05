class GADDAGNode {
    constructor(){
        this.children = {}; // Stores the letter paths
        this.isWord = false; // Marks if it is the end of a valid word
    }
}

class GADDAG {
    constructor() {
        this.root = new GADDAGNode();
    }

    // Insert words into the GADDAG structure
    insert(word) {
        let transformedWords = this.generateGADDAGForms(word);
        for (let transformedWord of transformedWords) {
            this.addWord(transformedWord);
        }
    }

    // Generate different word transformations
    generateGADDAGForms(word) {
        let forms = [];
        for (let i = 0; i < word.length; i++) {
            let prefix = word.substring(0, i + 1);
            let suffix = word.substring(i + 1);
            forms.push(`${suffix}<${prefix}`);
        }
        return forms;
    }

    // Add a word into the trie
    addWord(word) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) {
                node.children[char] = new GADDAGNode();
            }
            node = node.children[char];
        }
        node.isWord = true;
    }

    // Search for a word in the trie
    search(word) {
        let node = this.root;
        for (let char of word) {
            if (!node.children[char]) return false;
            node = node.children[char];
        }
        return node.isWord;
    }
}

// Create GADDAG from dictionary
export function createGADDAG(dictionary) {
    window.gaddag = new GADDAG();
    
    for (const word of dictionary) {
        window.gaddag.insert(word);
      }

    return gaddag;
}

// Function to find all possible words
export function findPossibleWords(tiles, gaddag, board) {
    console.log("Tiles given:", tiles);

    let validWords = [];

    function boardHasLetters(board) {
        for (let row of board) {
            for (let cell of row) {
                if (cell !== null && cell !== "") return true;
            }
        }
        return false;
    }

    function getBoardLetters(board) {
        let letters = new Set();
        for (let row of board) {
            for (let cell of row) {
                if (cell !== null && cell !== "") {
                    letters.add(cell);
                }
            }
        }
        return letters;
    }

    const hasAnchors = boardHasLetters(board);
    const boardLetters = hasAnchors ? getBoardLetters(board) : null;

    function searchTrie(node, path, remainingTiles, crossedPivot, usedBoardLetter) {
        const candidateWord = path.replace('<', '');

        if (node.isWord && crossedPivot && (usedBoardLetter || !hasAnchors)) {
            // Only accept words that are actually in the dictionary
            if (window.wordDefinitions.has(candidateWord)) {
                console.log(`Found valid word: ${candidateWord}`);
                validWords.push(candidateWord);
            } else {
                console.warn(`Rejected fake word: ${candidateWord}`);
            }
        }

        for (let letter in node.children) {
            if (letter === "<" && !crossedPivot) {
                searchTrie(node.children[letter], path + letter, remainingTiles, true, usedBoardLetter);
            } else {
                let canUseTile = remainingTiles.includes(letter);
                let canUseBoardLetter = hasAnchors && boardLetters.has(letter);

                if (canUseTile || canUseBoardLetter) {
                    let nextTiles = [...remainingTiles];
                    let usedBoard = usedBoardLetter;

                    if (canUseTile) {
                        let idx = nextTiles.indexOf(letter);
                        if (idx !== -1) nextTiles.splice(idx, 1);
                    } else if (canUseBoardLetter) {
                        usedBoard = true;
                    }

                    searchTrie(node.children[letter], path + letter, nextTiles, crossedPivot, usedBoard);
                }
            }
        }
    }

    searchTrie(gaddag.root, "", tiles, false, false);
    return validWords;
}