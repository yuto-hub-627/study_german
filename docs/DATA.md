# 辞書データの再生成

```bash
D=/tmp/lexdata; mkdir -p $D
curl -sS https://kaikki.org/dictionary/German/kaikki.org-dictionary-German.jsonl | python3 scripts/extract_de.py $D/de_lemmas.jsonl
curl -sS "https://kaikki.org/jawiktionary/%E3%83%89%E3%82%A4%E3%83%84%E8%AA%9E/kaikki.org-dictionary-%E3%83%89%E3%82%A4%E3%83%84%E8%AA%9E.jsonl" -o $D/ja_de.jsonl
curl -sS https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/de/de_50k.txt -o $D/de_50k.txt
curl -sS https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl | python3 scripts/pivot_en.py $D/en_pivot.json $D/de_50k.txt
python3 scripts/build_lexicon.py $D public/dict/lexicon.json
python3 scripts/build_textbook.py public/dict/lexicon.json data/textbook_words.tsv src/data/textbook.json
```
- 日本語訳: 日本語版Wiktionary → 英語版Wiktionaryの翻訳表経由の順で採用
- ライセンス: Wiktionary (CC BY-SA 4.0), FrequencyWords (CC BY-SA 4.0)
