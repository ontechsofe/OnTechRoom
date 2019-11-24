package ca.jame.ontechroom.Activities;

import android.app.Dialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import java.util.Map;
import java.util.UUID;

import androidx.appcompat.app.AppCompatActivity;

import ca.jame.ontechroom.R;
import ca.jame.ontechroom.API.OTR;
import ca.jame.ontechroom.API.db.user.UserDB;
import ca.jame.ontechroom.API.types.User;

public class LoginActivity extends AppCompatActivity {

    TextView id;
    TextView password;

    Dialog dialog;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        id = findViewById(R.id.idTxt);
        password = findViewById(R.id.passwordTxt);
        dialog = new Dialog(LoginActivity.this);
    }

    public void doLogin(View view) {
        showDialog();
        new Thread(() -> {
            String userID = id.getText().toString();
            String pass = password.getText().toString();
            Map<String, Object> response = OTR.getInstance().authenticate(userID, pass);
            System.out.println(response);
            assert response != null;
            if (response.containsKey("error")) {
                hideDialog();
            } else {
                UserDB userDB = new UserDB(getApplicationContext());
                User u = new User();
                u.firstName = ((Map<String, String>) response.get("name")).get("first");
                u.lastName = ((Map<String, String>) response.get("name")).get("last");
                u.uuid = UUID.randomUUID().toString();
                u.studentId = userID;
                u.password = pass;
                userDB.addUserData(u);
                dialog.dismiss();
                Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
                overridePendingTransition(R.anim.fade_in, R.anim.fade_out);
                finish();
            }
        }).start();
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
