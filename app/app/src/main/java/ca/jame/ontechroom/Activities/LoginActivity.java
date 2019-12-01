package ca.jame.ontechroom.Activities;

import android.app.Dialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.EditText;
import android.widget.TextView;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

import androidx.appcompat.app.AppCompatActivity;
import ca.jame.ontechroom.API.OTR;
import ca.jame.ontechroom.API.db.user.UserDB;
import ca.jame.ontechroom.API.types.User;
import ca.jame.ontechroom.R;

public class LoginActivity extends AppCompatActivity {

    EditText id;
    EditText password;
    TextView error;

    Dialog dialog;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        id = findViewById(R.id.idTxt);
        password = findViewById(R.id.passwordTxt);
        error = findViewById(R.id.errotTxt);
        dialog = new Dialog(LoginActivity.this);
    }

    public void doLogin(View view) {
        showDialog();
        new Thread(() -> {
            hideError();
            String userID = id.getText().toString();
            String pass = password.getText().toString();
            Map<String, String> response = OTR.getInstance().authenticate(userID, pass); // TODO: make this a real object so I don't have a nullable
            System.out.println(response);
            if (response.containsKey("message") && ((String) Objects.requireNonNull(response.get("message"))).contains("Invalid")) {
                hideDialog();
                showError("Error: Invalid login details!");
            } else {
                UserDB userDB = new UserDB(getApplicationContext());
                User u = new User();
                u.firstName = response.get("first");
                u.lastName = response.get("last");
                u.uuid = UUID.randomUUID().toString();
                u.studentId = userID;
                u.password = pass;
                userDB.addUserData(u);
                hideDialog();
                Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
                finish();
            }
        }).start();
    }

    private void showError(String message) {
        runOnUiThread(() -> {
            error.setText(message);
            error.setVisibility(View.VISIBLE);
        });
    }

    private void hideError() {
        runOnUiThread(() -> {
            error.setVisibility(View.INVISIBLE);
        });
    }

    private void showDialog() {
        dialog.setContentView(R.layout.dialog_loading);
        dialog.setCancelable(false);
        dialog.setCanceledOnTouchOutside(false);
        dialog.show();
    }

    private void hideDialog() {
        dialog.dismiss();
    }
}
