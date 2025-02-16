#pragma once
#ifndef _SETTINGS_HEADER_
#define _SETTINGS_HEADER_

#include <winrt/Windows.Storage.h>
#include <winrt/Windows.Foundation.h>

namespace AppSettings {
	void Save(const winrt::hstring& key, const winrt::hstring& value);

	winrt::hstring Load(const winrt::hstring& key);

	void Delete(const winrt::hstring& key);
	
	void Clear();

	void GenDefaults();
}

#endif
