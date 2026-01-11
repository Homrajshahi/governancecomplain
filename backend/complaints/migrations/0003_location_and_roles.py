from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("complaints", "0002_userprofile"),
    ]

    operations = [
        migrations.AddField(
            model_name="userprofile",
            name="assigned_district",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="assigned_office",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="assigned_province",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="userprofile",
            name="role",
            field=models.CharField(
                choices=[("user", "User"), ("admin", "Admin")], default="user", max_length=20
            ),
        ),
        migrations.AddField(
            model_name="complaint",
            name="district",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="complaint",
            name="office",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="complaint",
            name="province",
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name="complaint",
            name="remarks",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name="complaint",
            name="status",
            field=models.CharField(
                choices=[
                    ("Pending", "Pending"),
                    ("In Progress", "In Progress"),
                    ("Rejected", "Rejected"),
                    ("Resolved", "Resolved"),
                ],
                default="Pending",
                max_length=20,
            ),
        ),
    ]
