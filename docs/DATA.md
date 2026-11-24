# 辞書データの再生成

```bash
D=/tmp/lexdata; mkdir -p $D
curl -sS https://kaikki.org/dictionary/German/kaikki.org-dictionary-German.jsonl -o $D/de_raw.jsonl
python3 scripts/extract_de.py $D/de_lemmas.jsonl $D/de_examples.jsonl < $D/de_raw.jsonl   # 2番目は Wiktionary の例文
python3 scripts/extract_phrases.py $D/phrases.jsonl < $D/de_raw.jsonl
curl -sS "https://kaikki.org/jawiktionary/%E3%83%89%E3%82%A4%E3%83%84%E8%AA%9E/kaikki.org-dictionary-%E3%83%89%E3%82%A4%E3%83%84%E8%AA%9E.jsonl" -o $D/ja_de.jsonl
curl -sS https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/de/de_50k.txt -o $D/de_50k.txt
curl -sS https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/de/de_full.txt -o $D/de_full.txt
head -300000 $D/de_full.txt > $D/de_300k.txt
curl -sS https://kaikki.org/dictionary/English/kaikki.org-dictionary-English.jsonl | python3 scripts/pivot_en.py $D/en_pivot.json $D/de_300k.txt
python3 scripts/build_lexicon.py $D public/dict/lexicon.json
# 例文 (Tatoeba のドイツ語-日本語対訳。直接の対訳がなければ英語などを1つ挟んでつなぐ)
for f in deu jpn; do curl -sS https://downloads.tatoeba.org/exports/per_language/$f/${f}_sentences.tsv.bz2 | bunzip2 > $D/${f}_sentences.tsv; done
curl -sS https://downloads.tatoeba.org/exports/links.tar.bz2 | tar xj -C $D
python3 scripts/tatoeba_pairs.py $D $D/de_ja_pairs.tsv
python3 scripts/build_examples.py public/dict/lexicon.json $D public/dict/ex
python3 scripts/build_textbook.py public/dict/lexicon.json data/textbook_words.tsv src/data/textbook.json
```
- 日本語訳: 日本語版Wiktionary → 英語版Wiktionaryの翻訳表経由の順で採用
- 収録語: 頻度リスト（de_full）の上位40万位以内に出てくる見出し語＋日本語版Wiktionaryにある語（約5.1万語＋熟語）
- 活用形→基本形の予測（isst → essen）は、辞書の活用データからアプリ側で逆引き表を作る（`src/lib/lexicon.ts` の `lookupForm`）。追加データは不要
- 例文: `public/dict/ex/<頭文字>.json`。1語あたり Tatoeba（日本語訳つき）最大3文＋Wiktionary（英訳つき）。辞書の単語ページで頭文字のファイルだけ読み込む
- ライセンス: Wiktionary (CC BY-SA 4.0), FrequencyWords (CC BY-SA 4.0), Tatoeba (CC BY 2.0 FR)
