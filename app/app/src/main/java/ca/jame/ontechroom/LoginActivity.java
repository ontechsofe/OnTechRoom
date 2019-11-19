package ca.jame.ontechroom;

import android.app.Dialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import ca.jame.ontechroom.api.OTR;

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

    // Button click for logging in
    // TODO: Add login logic
    public void doLogin(View view) {
        showDialog();
        new Thread(() -> {
            String userID = id.getText().toString();
            String pass = password.getText().toString();
            String response = OTR.getInstance().authenticate(userID, pass);
            System.out.println(response);
            if (response.contains("error")) {
                hideDialog();
            } else {
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
