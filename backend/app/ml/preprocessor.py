"""
NLP Preprocessing module for Hindi and Hinglish Civic Complaints.
Handles Unicode normalization, punctuation cleaning, Hindi stopwords removal,
and Hinglish-to-Hindi phonetic normalization.
"""

import re
import unicodedata

# Curated set of Hindi stopwords
HINDI_STOPWORDS = {
    'के', 'का', 'एक', 'में', 'की', 'है', 'यह', 'पर', 'इस', 'होते', 'कि', 'जो', 'कर',
    'मे', 'गया', 'करने', 'किया', 'लिये', 'अपने', 'ने', 'बनी', 'नहीं', 'तो', 'ही', 'या',
    'एवं', 'दिया', 'होता', 'गए', 'थी', 'रहे', 'तथा', 'अंदर', 'दिए', 'उन', 'गई', 'था',
    'थे', 'हुई', 'होती', 'हूँ', 'हैं', 'से', 'को', 'और', 'हो', 'गए', 'रहा', 'रही',
    'होने', 'भी', 'बहुत', 'कुछ', 'तक', 'द्वारा', 'साथ', 'हुए', 'वाले', 'होगा', 'होगी'
}

# Hinglish civic keyword and conversational mappings to ensure robust classification for romanized input
HINGLISH_MAP = {
    # Pronouns, prepositions, aux verbs
    r'\bhamare\b': 'हमारे',
    r'\bhumare\b': 'हमारे',
    r'\bhamaare\b': 'हमारे',
    r'\bkshetra\b': 'क्षेत्र',
    r'\barea\b': 'क्षेत्र',
    r'\bmoh?al+a+\b': 'क्षेत्र',
    r'\bgali\b': 'गली',
    r'\bme\b': 'में',
    r'\bmein\b': 'में',
    r'\bse\b': 'से',
    r'\bki\b': 'की',
    r'\bke\b': 'के',
    r'\bka\b': 'का',
    r'\bko\b': 'को',
    r'\bpar\b': 'पर',
    r'\bna+hi+n?\b': 'नहीं',
    r'\bnaa\b': 'नहीं',
    r'\baa\b': 'आ',
    r'\braha\b': 'रहा',
    r'\brahi\b': 'रही',
    r'\brahe\b': 'रहे',
    r'\bha+i+\b': 'है',
    r'\bha+i+n\b': 'हैं',
    r'\bth+a+\b': 'था',
    r'\bth+i+\b': 'थी',
    r'\bth+e+\b': 'थे',
    r'\bhua\b': 'हुआ',
    r'\bhui\b': 'हुई',
    r'\bhue\b': 'हुए',
    r'\bgaya\b': 'गया',
    r'\bgayi\b': 'गई',
    r'\bga+ye?\b': 'गए',
    r'\bho\b': 'हो',
    r'\bbohot\b': 'बहुत',
    r'\bbahut\b': 'बहुत',
    r'\bbaad\b': 'बाद',
    r'\bpehle\b': 'पहले',
    r'\bpichhle\b': 'पिछले',
    r'\bpichle\b': 'पिछले',
    r'\baaj\b': 'आज',
    r'\bkal\b': 'कल',
    r'\broz\b': 'रोज',
    r'\bbar\s*bar\b': 'बार-बार',

    # Water Supply
    r'\bpa+n+i+\b': 'पानी',
    r'\bpi+pe?\s*li+ne?\b': 'पाइप लाइन',
    r'\bpi+pe?\b': 'पाइप लाइन',
    r'\bna+l\b': 'नल',
    r'\btap\b': 'नल',
    r'\bsupply\b': 'सप्लाई',
    r'\bpeene\b': 'पीने',

    # Electricity
    r'\bbij+l+i+\b': 'बिजली',
    r'\bpower\b': 'बिजली',
    r'\bcurrent\b': 'बिजली',
    r'\btrans+form+er?\b': 'ट्रांसफार्मर',
    r'\bfuse\b': 'फ्यूज',
    r'\bvoltage\b': 'बिजली',
    r'\bshort\s*circuit\b': 'शॉर्ट सर्किट',

    # Roads
    r'\bra+s+t[aeo]\b': 'सड़क',
    r'\bra+a?sta+\b': 'सड़क',
    r'\bra+a?ste?\b': 'सड़क',
    r'\bsada?k\b': 'सड़क',
    r'\bsadke?n?\b': 'सड़क',
    r'\broads?\b': 'सड़क',
    r'\bhighway\b': 'सड़क',
    r'\bkhad+d?[aeo]\b': 'गड्ढे',
    r'\bkhad+d?a+\b': 'गड्ढे',
    r'\bkhad+e?\b': 'गड्ढे',
    r'\bgad+d?[aeo]\b': 'गड्ढे',
    r'\bgad+d?h?[aeo]\b': 'गड्ढे',
    r'\bgad+h?a+\b': 'गड्ढे',
    r'\bpothole?s?\b': 'गड्ढे',
    r'\bba+d+e?\b': 'बड़े',
    r'\bba+d+a+\b': 'बड़े',
    r'\bmaram+mat\b': 'मरम्मत',
    r'\brepair\b': 'मरम्मत',
    r'\baavashyakta\b': 'आवश्यकता',
    r'\bjarurat\b': 'आवश्यकता',
    r'\bzarurat\b': 'आवश्यकता',

    # Garbage
    r'\bka+ch+r+a+\b': 'कचरा',
    r'\bka+ch+re?\b': 'कचरे',
    r'\bkoo?da\b': 'कचरा',
    r'\bgarbage\b': 'कचरा',
    r'\bwaste\b': 'कचरा',
    r'\bsaf+a+i+\b': 'सफाई',
    r'\bcleaning\b': 'सफाई',
    r'\bkarmchari\b': 'कर्मचारी',
    r'\bdher\b': 'ढेर',
    r'\buthaya\b': 'उठाया',

    # Drainage
    r'\bna+l+i+\b': 'नाली',
    r'\bdrain\b': 'नाली',
    r'\bdrainage\b': 'नाली',
    r'\bjalbharav\b': 'जलभराव',
    r'\bwaterlogging\b': 'जलभराव',
    r'\bjaam\b': 'जाम',
    r'\bblocked\b': 'जाम',
    r'\bsamasya\b': 'समस्या',

    # Street Lights
    r'\bstreet\s*light\b': 'स्ट्रीट लाइट',
    r'\blight\b': 'स्ट्रीट लाइट',
    r'\bandh+e?ra+\b': 'अंधेरा',
    r'\bdark\b': 'अंधेरा',
    r'\braat\b': 'रात',
    r'\bbulb\b': 'बल्ब',
    r'\bbatti\b': 'स्ट्रीट लाइट',

    # Sewage
    r'\bsewer\b': 'सीवर',
    r'\bsewerage\b': 'सीवर',
    r'\bganda\b': 'गंदा',
    r'\boverflow\b': 'ओवरफ्लो',
    r'\bfail\b': 'फैल',

    # Public Transport
    r'\bbus\b': 'बस',
    r'\btransport\b': 'परिवहन',
    r'\btime\b': 'समय',
    r'\bsamay\b': 'समय',
    r'\blate\b': 'देर',
    r'\bder\b': 'देर',
    r'\bseva\b': 'सेवा',

    # General terms
    r'\bdino?n?\b': 'दिनों',
    r'\bdin\b': 'दिन',
    r'\bghanto?n?\b': 'घंटों',
    r'\bghante\b': 'घंटों',
    r'\bband\b': 'बंद',
    r'\bkharab\b': 'खराब',
    r'\btoot\b': 'टूट',
    r'\bphut\b': 'टूट'
}

def clean_and_preprocess_text(text: str, remove_stopwords: bool = False) -> str:
    """
    Cleans and normalizes Hindi and Hinglish text.
    1. Unicode normalization (NFC)
    2. Lowercase conversion for Latin text
    3. Hinglish phonetic token enrichment
    4. Strips non-Devanagari/alphanumeric characters, punctuation, and danda
    5. Normalizes whitespace
    6. Optionally removes common Hindi stopwords
    """
    if not isinstance(text, str) or not text.strip():
        return ""
    
    # 1. Unicode NFC normalization
    text = unicodedata.normalize('NFC', text)
    
    # 2. Lowercase
    text = text.lower()
    
    # 3. Hinglish phonetic enrichment (maps common romanized Hindi civic words)
    for pattern, hindi_word in HINGLISH_MAP.items():
        text = re.sub(pattern, f" {hindi_word} ", text, flags=re.IGNORECASE)
    
    # 4. Remove punctuation, keep Devanagari (\u0900-\u097F), Latin alphanumeric, and spaces
    text = re.sub(r'[^\w\s\u0900-\u097F]', ' ', text)
    
    # 5. Normalize whitespace
    tokens = text.split()
    
    # 6. Optional stopwords removal
    if remove_stopwords:
        tokens = [tok for tok in tokens if tok not in HINDI_STOPWORDS]
    
    return " ".join(tokens)
