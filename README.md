# Wykop Simple Notifier
Dodatek, który pozwolić być Ci na bieżąco z powiadomieniami na wykopie. Nie musisz się nigdzie rejestrować ani kombinować z API.

Wykop Simple Notifier co ustalony czas sprawdza stronę wykop.pl pod katem nowych powiadomień i jeśli się jakieś pojawi, poinformuje Cię o tym dźwiękowo (można oczywiście wyłączyć te opcję) oraz wyświetli liczbę powiadomień na ikonie rozszerzenia.

## Jak to działa?

Rozszerzenie co określoną ilość sekund otwiera w tle stronę wykopu (konfiguracja interwału jest w ustawieniach). W jej treści sprawdza, czy jest jakieś nowe powiadomienie i informuje o tym fakcie użytkownika w sposób wybrany w ustawieniach. Rozszerzenie potrzebuje tylko jednego uprawnienia - odczytywania danych ze strony wykop.pl, ponieważ musi ją otworzyć i pobrać treść. 

## Dlaczego nie Wykop API?

Ponieważ ma ono limity zapytań, więc przy kilku użytkownikach dodatek przestałby działać. Każdy z użytkowników musiałby generować w ustawieniach wykopu swoją własną aplikację, następnie podawać w rozszerzeniu jej klucze i token autoryzujący, a potem regularnie odnawiać połączenie. Byłoby to uciążliwe rozwiązanie, które nie ma większego sensu w takim dodatku. Znacznie prościej dla końcowego użytkownika jest po prostu załadować stronę główną wykopu i wyciągnąć z niej informacje o powiadomieniach.

## Jak zainstalować dodatek w swojej przeglądarce?

Rozszerzenia Chrome (i nie tylko) to zwykłe archiwa ZIP ze zmienionym rozszerzeniem. Sama przegladarka umożliwia jednak instalację dodatku, który nie jest spakowany. Włączając tryb programisty (Rozszerzenia -> Tryb programisty) pojawiają się dodatkowe przyciski, między innymi "Wczytaj rozszerzenie bez pakietu...". Wystarczy wtedy wskazać folder w którym znajdują się pliki źródłowe rozszerzenia. Najważniejszym plikiem jest manifest.json.

## Co z Firefoxem?

Rozszerzenia Chrome'a po drobnych modyfikacjach mogą być wykorzystywane także w przeglądarce Firefox. Aktualna wersja rozszerzenia znajduje się tutaj: https://addons.mozilla.org/pl/firefox/addon/wykop-simple-notifier/

Wersja dla firefoxa wymaga niewielkiej modyfikacji pliku manifest.json.
