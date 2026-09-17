from sklearn.datasets import fetch_california_housing
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error,r2_score
import pandas as pd
import joblib

print("loading datasets")
data=fetch_california_housing()

X= pd.DataFrame(data.data, columns=data.feature_names)
Y=data.target

print(f"total records:{X.shape[0]}")

X_train,X_test,Y_train,Y_test = train_test_split(X,Y,
                                                 test_size=0.2,
                                                 random_state=42)

# training a model
model= RandomForestRegressor(
    n_estimators=100,
    random_state=42
)
model.fit(X_train,Y_train)

Y_pred = model.predict(X_test)
mae=mean_absolute_error(Y_test,Y_pred)
r2= r2_score(Y_test,Y_pred)

print(f"average error: ${mae * 100000:,.0f}")


#  train model save here
joblib.dump(model,"house_model.joblib")      
#  column name save
joblib.dump(list(X.columns),"house_features.joblib")