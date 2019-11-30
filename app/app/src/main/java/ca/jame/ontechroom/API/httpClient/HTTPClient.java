package ca.jame.ontechroom.API.httpClient;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.util.Map;
import java.util.Objects;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class HTTPClient {

    private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");

    public static String get(String url) throws IOException {
        OkHttpClient client = new OkHttpClient();
        Request request = new Request.Builder()
                .url(url)
                .build();
        try (Response response = client.newCall(request).execute()) {
            return Objects.requireNonNull(response.body()).string();
        }
    }

    public static String post(String url, Map<String, String> body) throws IOException {
        Gson gson = new Gson();
        Type jsonMap = new TypeToken<Map>(){}.getType();
        OkHttpClient client = new OkHttpClient();
        RequestBody data = RequestBody.create(JSON, gson.toJson(body, jsonMap));
        Request request = new Request.Builder()
                .url(url)
                .post(data)
                .build();
        try (Response response = client.newCall(request).execute()) {
            return Objects.requireNonNull(response.body()).string();
        }
    }
}
