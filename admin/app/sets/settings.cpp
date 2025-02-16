
#include "pch.h"

#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Foundation.h>

namespace AppSettings {
	void Save(const winrt::hstring& key, const winrt::hstring& value) {
		auto sets = winrt::Windows::Storage::ApplicationData::Current().LocalSettings();
		sets.Values().Insert(winrt::hstring(key), winrt::box_value(value));
	}

	winrt::hstring Load(const winrt::hstring& key) {
		auto sets = winrt::Windows::Storage::ApplicationData::Current().LocalSettings();
		if (sets != nullptr) {
			if (sets.Values().HasKey(winrt::hstring(key))) {
				return winrt::unbox_value<winrt::hstring>(sets.Values().Lookup(winrt::hstring(key)));
			}
			else return L"NULL";
		}
		else return L"SETS_ARE_EMPTY";
	}

	void Delete(const winrt::hstring& key) {
		auto sets = winrt::Windows::Storage::ApplicationData::Current().LocalSettings();

		if (sets != nullptr && sets.Values().HasKey(winrt::hstring(key))) {
			sets.Values().Remove(winrt::hstring(key));
		}
	}

	void Clear() {
		auto sets = winrt::Windows::Storage::ApplicationData::Current().LocalSettings();

		if (sets != nullptr) {
			sets.Values().Clear();
		}
	}

	void GenDefaults() {
		if (Load(L"token") == L"SETS_ARE_EMPTY") {
			Save(L"token", L"none");
			Save(L"theme", L"light");
			Save(L"role", L"none");
		}
		else {
			Clear();
			Save(L"token", L"none");
			Save(L"theme", L"light");
			Save(L"role", L"none");
		}
	}
}
