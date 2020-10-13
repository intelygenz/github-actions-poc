package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHandlerGreetings(t *testing.T) {
	ts := httptest.NewServer(setupServer())
	defer ts.Close()

	url := fmt.Sprintf("%s/greetings", ts.URL)
	payload := "{\"name\":\"Pepito\"}"
	resp, err := http.Post(url, "application/json", strings.NewReader(payload))
	if err != nil {
		t.Fatalf("Expected no error, got %v", err)
	}

	if resp.StatusCode != http.StatusOK {
		t.Fatalf("Expected status code %d, got %v", http.StatusOK, resp.StatusCode)
	}
	bodyBytes, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatal(err)
	}
	bodyString := string(bodyBytes)
	if bodyString != "Greetings Pepito" {
		t.Fatalf("Expected different response: %v", resp.Body)
	}

}
